'use client'

import { FormError } from '@/components/forms/FormError'
import { FormItem } from '@/components/forms/FormItem'
import { Message } from '@/components/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
}

type Props = {
  locale: string
}

export const LoginForm = ({ locale }: Props) => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data)
        if (redirect?.current) router.push(redirect.current)
        else router.push(`/${locale}/account`)
      } catch (_) {
        setError(
          locale === 'de'
            ? 'Es gab einen Fehler mit den bereitgestellten Anmeldeinformationen. Bitte versuchen Sie es erneut.'
            : 'There was an error with the credentials provided. Please try again.',
        )
      }
    },
    [login, router],
  )

  return (
    <form className="" onSubmit={handleSubmit(onSubmit)}>
      <Message className="classes.message" error={error} />
      <div className="flex flex-col gap-8">
        <FormItem>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email', { required: 'Email is required.' })}
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password">{locale === 'de' ? 'Passwort' : 'Password'}</Label>
          <Input
            id="password"
            type="password"
            {...register('password', { required: 'Please provide a password.' })}
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <div className="text-primary/70 mb-6 prose prose-a:hover:text-primary dark:prose-invert">
          <p>
            {locale === 'de' ? 'Haben Sie Ihr Passwort vergessen?' : 'Forgot your password?'}{' '}
            <Link href={`/forgot-password${allParams}`}>
              {locale === 'de' ? 'Klicken Sie hier, um es zurückzusetzen' : 'Click here to reset it'}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-between">
        <Button asChild variant="outline" size="lg">
          <Link href={`/${locale}/create-account${allParams}`} className="grow max-w-[50%]">
            {locale === 'de' ? 'Konto erstellen' : 'Create an account'}
          </Link>
        </Button>
        <Button className="grow" disabled={isLoading} size="lg" type="submit" variant="default">
          {isLoading ? (locale === 'de' ? 'Verarbeite' : 'Processing') : (locale === 'de' ? 'Weiter' : 'Continue')}
        </Button>
      </div>
    </form>
  )
}
