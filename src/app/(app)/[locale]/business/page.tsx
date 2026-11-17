import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

export default async function BusinessIndexPage({ params }: Props) {
  const { locale } = await params
  redirect(`/${locale}/business/dashboard`)
}
