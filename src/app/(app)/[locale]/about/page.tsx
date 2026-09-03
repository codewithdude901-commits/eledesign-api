type Props = {
  params: Promise<{
    locale: 'de' | 'en'
  }>
}

const AboutPage = async ({ params }: Props) => {
  const { locale } = await params
  return (
    <div>
      About Page
      <p> The selected language is: {locale}</p>
    </div>
  )
}

export default AboutPage
