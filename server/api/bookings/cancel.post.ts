type CancellableBooking = {
  id: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  stripe_session_id: string | null
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body?.token

  if (
    typeof token !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid cancellation token'
    })
  }

  setHeader(event, 'Cache-Control', 'no-store')

  const supabase = getSupabaseAdminClient()
  const stripe = getStripeClient()

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, status, stripe_session_id')
    .eq('cancellation_token', token)
    .maybeSingle<CancellableBooking>()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load booking'
    })
  }

  if (!booking) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Booking not found'
    })
  }

  if (booking.status === 'paid') {
    return { status: 'paid' }
  }

  if (booking.status === 'cancelled') {
    return { status: 'cancelled' }
  }

  if (!booking.stripe_session_id) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Checkout is not ready'
    })
  }

  let session = await stripe.checkout.sessions.retrieve(
    booking.stripe_session_id
  )

  // Un pagamento completato non può essere annullato qui.
  if (session.status === 'complete') {
    return { status: 'completed' }
  }

  if (session.status === 'open') {
    try {
      session = await stripe.checkout.sessions.expire(session.id)
    } catch {
      // Potrebbe essere stato completato mentre lo annullavamo.
      session = await stripe.checkout.sessions.retrieve(session.id)

      if (session.status === 'complete') {
        return { status: 'completed' }
      }
    }
  }

  if (session.status !== 'expired') {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to close checkout'
    })
  }

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id)
    .in('status', ['pending', 'expired'])
    .select('id')

  if (updateError || !updated?.length) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Unable to cancel booking'
    })
  }

  return { status: 'cancelled' }
})