import { expect, Page, test, APIRequestContext, Browser } from '@playwright/test'

const baseURL = 'http://localhost:3000'
const locale = 'de'

const b2bEmail = `b2b-e2e-${Date.now()}@example.com`
const b2bPassword = 'TestPass123!'
const b2bCompany = 'E2E Test GmbH'
const adminEmail = 'admin@test.com'
const adminPassword = 'admin'

let b2bProductSlug: string | null = null
let orderID: string | null = null

async function setupAdminContext(browser: Browser): Promise<APIRequestContext> {
  const context = await browser.newContext()

  // Ensure an admin user exists (first user created becomes admin via ensureFirstUserIsAdmin)
  await context.request
    .post(`${baseURL}/api/users`, {
      data: { email: adminEmail, password: adminPassword, roles: ['admin'] },
    })
    .catch(() => {}) // may already exist

  // Log in as admin via the browser to obtain an authenticated request context
  const page = await context.newPage()
  await page.goto(`${baseURL}/login`)
  await page.fill('input[name="email"]', adminEmail)
  await page.fill('input[name="password"]', adminPassword)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/account/)
  await page.close()

  return context.request
}

async function loginAsB2B(page: Page) {
  await page.goto(`${baseURL}/${locale}/business/login`)
  await page.fill('input[id="business-email"]', b2bEmail)
  await page.fill('input[id="business-password"]', b2bPassword)
  await page.click('button[type="submit"]')
  await page.waitForURL(`/${locale}/business/dashboard`)
}

test.describe('B2B portal', () => {
  test.beforeAll(async ({ browser }) => {
    const adminRequest = await setupAdminContext(browser)

    // Create a B2B-eligible product via authenticated API
    const productRes = await adminRequest.post(`${baseURL}/api/products`, {
      data: {
        title: 'B2B E2E Test Product',
        slug: `b2b-e2e-product-${Date.now()}`,
        b2bPriceInEUR: 5000,
        b2bMinOrderQuantity: 1,
        priceInEUR: 10000,
        inventory: 100,
        _status: 'published',
        product_status: 'active',
        layout: [],
      },
    })
    const product = await productRes.json()
    b2bProductSlug = product.doc.slug

    // Create an approved B2B user via authenticated API (admin context bypasses guardB2BUserCreate)
    await adminRequest.post(`${baseURL}/api/users`, {
      data: {
        email: b2bEmail,
        password: b2bPassword,
        accountType: 'b2b',
        b2b: {
          companyName: b2bCompany,
          status: 'approved',
          vatId: 'DE123456789',
          discountPercent: 10,
        },
        roles: ['customer', 'b2b'],
      },
    })

    // Make adminRequest available to tests via a module-level reference
    ;(globalThis as unknown as { __b2bAdminRequest?: APIRequestContext }).__b2bAdminRequest =
      adminRequest
  })

  test.afterAll(async ({ browser }) => {
    const adminRequest = (globalThis as unknown as { __b2bAdminRequest?: APIRequestContext })
      .__b2bAdminRequest

    if (adminRequest && b2bProductSlug) {
      const findRes = await adminRequest.get(
        `${baseURL}/api/products?where=${encodeURIComponent(
          JSON.stringify({ slug: { equals: b2bProductSlug } }),
        )}`,
      )
      const findData = await findRes.json()
      const doc = findData.docs?.[0]
      if (doc?.id) {
        await adminRequest.delete(`${baseURL}/api/products/${doc.id}`)
      }
    }

    if (adminRequest) {
      const findRes = await adminRequest.get(
        `${baseURL}/api/users?where=${encodeURIComponent(
          JSON.stringify({ email: { equals: b2bEmail } }),
        )}&showHiddenFields=true`,
      )
      const findData = await findRes.json()
      const doc = findData.docs?.[0]
      if (doc?.id) {
        await adminRequest.delete(`${baseURL}/api/users/${doc.id}`)
      }
    }
  })

  test('business login redirects to dashboard', async ({ page, browser }) => {
    const adminRequest = (globalThis as unknown as { __b2bAdminRequest?: APIRequestContext })
      .__b2bAdminRequest!
    // Ensure B2B user exists (may have been cleaned by a parallel worker)
    const findRes = await adminRequest.get(
      `${baseURL}/api/users?where=${encodeURIComponent(
        JSON.stringify({ email: { equals: b2bEmail } }),
      )}&showHiddenFields=true`,
    )
    const findData = await findRes.json()
    if (!findData.docs?.[0]) {
      await adminRequest.post(`${baseURL}/api/users`, {
        data: {
          email: b2bEmail,
          password: b2bPassword,
          accountType: 'b2b',
          b2b: {
            companyName: b2bCompany,
            status: 'approved',
            vatId: 'DE123456789',
            discountPercent: 10,
          },
          roles: ['customer', 'b2b'],
        },
      })
    }

    await loginAsB2B(page)
    await expect(page.locator('h1')).toContainText('Geschäftskunden-Übersicht')
    await expect(page.locator(`text=${b2bCompany}`)).toBeVisible()
  })

  test('catalog shows B2B net prices, not retail', async ({ page }) => {
    await loginAsB2B(page)

    await page.goto(`${baseURL}/${locale}/business/catalog`)
    await expect(page.locator('h1')).toContainText('B2B-Katalog')

    await expect(page.locator('text=50,00 €')).toBeVisible()
    await expect(page.locator('text=netto zzgl. MwSt.')).toBeVisible()
    await expect(page.locator('text=100,00 €')).not.toBeVisible()
    await expect(page.locator('text=Kein B2B-Preis')).not.toBeVisible()
  })

  test('add to cart shows discounted net line total', async ({ page }) => {
    await loginAsB2B(page)

    await page.goto(`${baseURL}/${locale}/business/catalog/${b2bProductSlug}`)
    await expect(page.locator('h1')).toContainText('B2B E2E Test Product')

    await expect(page.locator('text=45,00 €')).toBeVisible()
    await expect(page.locator('text=Ihr Partnernachlass: 10%')).toBeVisible()

    await page.click('button:has-text("In den Warenkorb")')
    await expect(page.locator('text=Zum B2B-Warenkorb hinzugefügt.')).toBeVisible()

    await page.click('text=Warenkorb ansehen')
    await page.waitForURL(`/${locale}/business/cart`)
    await expect(page.locator('h1')).toContainText('Warenkorb')

    await expect(page.locator('text=45,00 €')).toBeVisible()
  })

  test('checkout creates order with invoice and bank details', async ({ page, browser }) => {
    await loginAsB2B(page)

    // Add product to cart via UI
    await page.goto(`${baseURL}/${locale}/business/catalog/${b2bProductSlug}`)
    await page.click('button:has-text("In den Warenkorb")')
    await expect(page.locator('text=Zum B2B-Warenkorb hinzugefügt.')).toBeVisible()

    const adminRequest = (globalThis as unknown as { __b2bAdminRequest?: APIRequestContext })
      .__b2bAdminRequest!

    // Get the cart ID via API to call the checkout endpoint directly
    const userRes = await adminRequest.get(
      `${baseURL}/api/users?where=${encodeURIComponent(
        JSON.stringify({ email: { equals: b2bEmail } }),
      )}&showHiddenFields=true`,
    )
    const userData = await userRes.json()
    const b2bUserID = userData.docs[0].id

    const cartRes = await adminRequest.get(
      `${baseURL}/api/carts?where=${encodeURIComponent(
        JSON.stringify({
          customer: { equals: b2bUserID },
          purchasedAt: { exists: false },
        }),
      )}`,
    )
    const cartData = await cartRes.json()
    const cartID = cartData.docs[0]?.id

    expect(cartID).toBeTruthy()

    // Call B2B checkout API directly (bypasses complex address-selection UI)
    const checkoutRes = await adminRequest.post(`${baseURL}/api/b2b/checkout`, {
      data: {
        cartID,
        billingAddress: {
          firstName: 'Hans',
          lastName: 'Mustermann',
          addressLine1: 'Musterstraße 1',
          postalCode: '10115',
          city: 'Berlin',
          country: 'Deutschland',
        },
        locale: 'de',
      },
    })

    expect(checkoutRes.ok()).toBeTruthy()
    const checkoutData = await checkoutRes.json()
    orderID = checkoutData.orderID
    expect(orderID).toBeTruthy()

    // View the order detail page
    await page.goto(`${baseURL}/${locale}/business/orders/${orderID}`)
    await expect(page.locator('h1')).toContainText('Bestellung')

    await expect(page.locator('text=Rechnung')).toBeVisible()
    await expect(page.locator('text=Rechnungsnummer')).toBeVisible()
    await expect(page.locator('text=Bankverbindung')).toBeVisible()
    await expect(page.locator('text=Zahlung ausstehend')).toBeVisible()
  })

  test('admin marks invoice paid, partner sees paid status', async ({ page }) => {
    expect(orderID).toBeTruthy()

    const adminRequest = (globalThis as unknown as { __b2bAdminRequest?: APIRequestContext })
      .__b2bAdminRequest!

    // Admin sets invoice.paidAt via API (triggers beforeChange hook -> b2bStatus = 'paid')
    await adminRequest.patch(`${baseURL}/api/orders/${orderID}`, {
      data: {
        invoice: {
          paidAt: new Date().toISOString(),
        },
      },
    })

    // Partner views the order and sees paid status
    await loginAsB2B(page)
    await page.goto(`${baseURL}/${locale}/business/orders/${orderID}`)
    await expect(page.locator('text=Zahlung eingegangen')).toBeVisible()
    await expect(page.locator('text=Bezahlt')).toBeVisible()
  })

  test('B2C smoke test: login, product page, cart still work', async ({ page, browser }) => {
    const adminRequest = (globalThis as unknown as { __b2bAdminRequest?: APIRequestContext })
      .__b2bAdminRequest!

    // Create a B2C customer via API
    const b2cEmail = `b2c-e2e-${Date.now()}@example.com`
    await adminRequest.post(`${baseURL}/api/users`, {
      data: { email: b2cEmail, password: b2bPassword },
    })

    // B2C login
    await page.goto(`${baseURL}/${locale}/login`)
    await page.fill('input[name="email"]', b2cEmail)
    await page.fill('input[name="password"]', b2bPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/account/)

    // View a product page (B2C)
    await page.goto(`${baseURL}/${locale}/products/${b2bProductSlug}`)
    await expect(page.locator('h1')).toContainText('B2B E2E Test Product')

    // B2C should see retail price, not B2B price
    await expect(page.locator('text=100,00 €')).toBeVisible()
  })
})
