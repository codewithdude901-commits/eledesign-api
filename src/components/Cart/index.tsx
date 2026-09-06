
import { Cart as CartType } from '@/payload-types'
import { CartModal } from './CartModal'

export type CartItem = NonNullable<CartType['items']>[number]

export function Cart({ locale }: { locale: 'de' | 'en' }) {
  return <CartModal locale={locale}/>
}
