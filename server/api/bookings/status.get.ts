type BookingStatusRow = {
  participants: number
  total_cents: number
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
}

export default defineEventHandler(async (event) => {
  const sessionId = getQuery(event).session_id

  if (
    typeof sessionId !== 'string' ||
    !sessionId.startsWith('cs_test_') ||
    sessionId.length > 255
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid checkout session'
    })
  }

  setHeader(event, 'Cache-Control', 'no-store')

  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('participants, total_cents, status')
    .eq('stripe_session_id', sessionId)
    .maybeSingle<BookingStatusRow>()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load booking status'
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Booking not found'
    })
  }

  return {
    status: data.status,
    participants: data.participants,
    total: data.total_cents / 100
  }
})