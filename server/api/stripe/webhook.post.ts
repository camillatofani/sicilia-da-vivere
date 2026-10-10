import type Stripe from 'stripe'

type PaymentBooking = {
  id: string
  total_cents: number
  status: string
  stripe_session_id: string | null
}

export default defineEventHandler(async (event) => {
  const signature = getHeader(event, 'stripe-signature')
  const rawBody = await readRawBody(event)
  const config = useRuntimeConfig()
  const stripe = getStripeClient()

  if (!signature || !rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing webhook signature or body'
    })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      config.stripeWebhookSecret
    )
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid webhook signature'
    })
  }

  if (
    stripeEvent.type !== 'checkout.session.completed' &&
    stripeEvent.type !== 'checkout.session.expired'
  ) {
    return { received: true }
  }

  const session = stripeEvent.data.object
  const bookingId = session.metadata?.bookingId

  if (!bookingId) {
    return { received: true }
  }

  const supabase = getSupabaseAdminClient()

  const { data: booking, error: readError } = await supabase
    .from('bookings')
    .select('id, total_cents, status, stripe_session_id')
    .eq('id', bookingId)
    .single<PaymentBooking>()

  if (readError || !booking) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load webhook booking'
    })
  }

  if (booking.stripe_session_id !== session.id) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Booking session mismatch'
    })
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    if (session.payment_status !== 'paid') {
      return { received: true }
    }

    if (
      session.currency !== 'eur' ||
      session.amount_total !== booking.total_cents
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Payment amount mismatch'
      })
    }

    // Stripe può inviare più volte lo stesso evento.
    if (booking.status === 'paid') {
      return { received: true }
    }

    if (booking.status !== 'pending') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unexpected booking status'
      })
    }

    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'paid' })
      .eq('id', bookingId)
      .eq('status', 'pending')
      .select('id')

    if (updateError || !updated?.length) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to confirm booking'
      })
    }
  } else {
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'expired' })
      .eq('id', bookingId)
      .eq('status', 'pending')

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to expire booking'
      })
    }
  }

  return { received: true }
})