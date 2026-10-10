type BookingRow = {
  id: string
  departure_id: number
  participants: number
  total_cents: number
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  expires_at: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const departureId = body?.departureId
  const participants = body?.participants

  if (
    !Number.isInteger(departureId) ||
    departureId <= 0 ||
    !Number.isInteger(participants) ||
    participants <= 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid booking data'
    })
  }

  const supabase = getSupabaseAdminClient()
  const stripe = getStripeClient()
  const config = useRuntimeConfig()

  const { data, error } = await supabase
    .rpc('reserve_booking', {
      p_departure_id: departureId,
      p_participants: participants
    })
    .single<BookingRow>()

  if (error) {
    console.error('Supabase reserve_booking:', error)

    if (error.message.includes('NOT_ENOUGH_SPOTS')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Not enough available spots'
      })
    }

    if (error.message.includes('DEPARTURE_NOT_FOUND')) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Departure not found'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create booking'
    })
  }

  if (!data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Booking was not returned'
    })
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Prenotazione Sicilia, da vivere'
            },
            unit_amount: data.total_cents
          },
          quantity: 1
        }
      ],

      metadata: {
        bookingId: data.id
      },

      expires_at: Math.floor(Date.now() / 1000) + 30 * 60 + 10,

      success_url:
        `${config.siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${config.siteUrl}/`
    },
    {
      idempotencyKey: `booking-${data.id}`
    }
  )

  const { error: saveError } = await supabase
    .from('bookings')
    .update({
      stripe_session_id: session.id
    })
    .eq('id', data.id)

  if (saveError || !session.url) {
    console.error('Unable to prepare checkout:', saveError)

    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to prepare checkout'
    })
  }

  return {
    id: data.id,
    departureId: data.departure_id,
    participants: data.participants,
    total: data.total_cents / 100,
    status: data.status,
    expiresAt: data.expires_at,
    checkoutUrl: session.url
  }
})