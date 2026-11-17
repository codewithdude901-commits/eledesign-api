import React from 'react'

type Props = {
  user?: {
    id?: string | number
    email?: string | null
  } | null
}

const navLinks = [
  {
    href: '/admin/collections/business-applications',
    label: 'Business applications',
    description: 'Review and approve partner applications',
  },
  {
    href: '/admin/collections/users',
    label: 'Users',
    description: 'Manage accounts and B2B details',
  },
  {
    href: '/admin/collections/orders',
    label: 'Orders',
    description: 'B2B orders and invoice settlement',
  },
  {
    href: '/admin/globals/b2b-settings',
    label: 'B2B settings',
    description: 'Bank details, VAT rate, invoice terms',
  },
]

export const BeforeDashboard: React.FC<Props> = ({ user }) => {
  const email = user?.email

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>B2B admin</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {email ? `Signed in as ${email}.` : 'Signed in.'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            style={{
              display: 'block',
              padding: '1rem',
              border: '1px solid #e2e8f0',
              borderRadius: 0,
              background: '#fff',
              color: '#1a1a1a',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{link.label}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#666' }}>{link.description}</p>
          </a>
        ))}
      </div>

      <div style={{ padding: '1rem', border: '1px solid #e2e8f0', background: '#fff' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Collections and globals</h3>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
          Pages, Categories, Media, Forms, Form Submissions, Home Page, Header and Footer remain
          available in the left-hand navigation.
        </p>
      </div>
    </div>
  )
}
