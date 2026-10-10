import type { CartItem } from '~~/shared/types/cart'

const STORAGE_KEY = 'sicilia-da-vivere-cart'

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const item = value as Record<string, unknown>

  return (
    typeof item.experienceId === 'number' &&
    Number.isSafeInteger(item.experienceId) &&
    item.experienceId > 0 &&
    typeof item.departureId === 'number' &&
    Number.isSafeInteger(item.departureId) &&
    item.departureId > 0 &&
    typeof item.participants === 'number' &&
    Number.isSafeInteger(item.participants) &&
    item.participants > 0
  )
}

export function useCart() {
  const cart = useState<CartItem | null>('cart', () => null)
  const cartReady = useState<boolean>('cart-ready', () => false)

  onMounted(() => {
    if (cartReady.value) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)

      if (saved) {
        const parsed: unknown = JSON.parse(saved)

        cart.value = isCartItem(parsed) ? parsed : null
      }
    } catch {
      cart.value = null
    }

    cartReady.value = true
  })

  function setCart(item: CartItem) {
    if (!isCartItem(item)) {
      throw new Error('Invalid cart item')
    }

    cart.value = { ...item }

    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart.value))
      } catch {
        // Il carrello resta utilizzabile senza persistenza.
      }
    }
  }

  function clearCart() {
    cart.value = null

    if (import.meta.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Lo stato in memoria è stato comunque svuotato.
      }
    }
  }

  return {
    cart: readonly(cart),
    cartReady: readonly(cartReady),
    setCart,
    clearCart
  }
}