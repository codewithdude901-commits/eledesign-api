'use client'

import { useParams } from 'next/navigation'

export default function Error({ reset }: { reset: () => void }) {
  const params = useParams<{ locale: 'de' | 'en' }>()

  const locale = params.locale
  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col  border border-neutral-200 bg-white p-8 md:p-12 dark:border-neutral-800 dark:bg-black">
      <h2 className="text-xl font-bold">Oh no!</h2>
      <p className="my-2">
        {locale === 'de'
          ? 'Es gab ein Problem mit unserem Shop. Dies könnte ein vorübergehendes Problem sein; bitte versuchen Sie es erneut.'
          : ' There was an issue with our storefront. This could be a temporary issue, please try your action again.'}
      </p>
      <button
        className="mx-auto mt-4 flex w-full items-center justify-center bg-emerald-600 p-4 tracking-wide text-white hover:opacity-90"
        onClick={() => reset()}
        type="button"
      >
        {locale === 'de' ? 'Versuchen Sie es erneut' : 'Try Again'}
      </button>
    </div>
  )
}
