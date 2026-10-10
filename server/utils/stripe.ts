import Stripe from 'stripe'

export function getStripeClient() {
  const config = useRuntimeConfig()

  return new Stripe(config.stripeSecretKey)
}