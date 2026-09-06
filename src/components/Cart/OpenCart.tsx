import { ShoppingBag } from 'lucide-react'

export function OpenCartButton({
  className,
  quantity,
  ...rest
}: {
  className?: string
  quantity?: number
}) {
  return (
    <button
      className="relative p-2.5 rounded-full text-black  hover:bg-black/5 transition-all duration-200 focus:outline-none flex items-center justify-center cursor-pointer"
      aria-label="Shopping Cart"
      {...rest}
    >
      <ShoppingBag className="w-5 h-5" />

      {quantity ? (
        <>
          <span className="absolute top-1 right-0.5 flex items-center justify-center min-w-4 h-4 px-1  text-[9px] font-bold rounded-full bg-black text-white ">
            {quantity}
          </span>
        </>
      ) : null}
    </button>
  )
}
