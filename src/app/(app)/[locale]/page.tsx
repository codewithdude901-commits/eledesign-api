import { FeaturedGardens } from '@/components/vibe-code-import/FeaturedGardens'
import { Hero } from '@/components/vibe-code-import/Hero'
import { PathSelector } from '@/components/vibe-code-import/PathSelector'
import { TrustBanner } from '@/components/vibe-code-import/TrustBanner'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function Home({ params }: Props) {
  const { locale } = await params

  const payload = await getPayload({ config: configPromise })
  const homePageData = await payload.findGlobal({
    slug: 'home-page',
    locale,
    depth: 2,
  })

  console.log('featuredGardens', homePageData.featuredProducts)

  return (
    <div className="flex flex-col min-h-screen">
      {/* The selected language is: {locale} */}
      <Hero hero={homePageData.hero} locale={locale} />
      <PathSelector pathSelector={homePageData.pathSelector} locale={locale} />
      <FeaturedGardens featuredGardens={homePageData.featuredProducts} locale={locale} />
      <TrustBanner trustBanner={homePageData.trustBanner} locale={locale} />
    </div>
  )
}
