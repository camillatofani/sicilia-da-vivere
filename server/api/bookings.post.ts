import type Stripe from 'stripe'
import { randomUUID } from 'node:crypto'

type BookingRow = {
    id: string
    departure_id: number
    participants: number
    total_cents: number
    status: 'pending' | 'paid' | 'expired' | 'cancelled'
    expires_at: string
    checkoutSessionId: string
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    const departureId = body?.departureId
    const participants = body?.participants
    const locale = body?.locale ?? 'it'

    if (locale !== 'it' && locale !== 'en') {
        throw createError({
            statusCode: 400,
            statusMessage: 'Unsupported locale'
        })
    }

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

    let session: Stripe.Checkout.Session | undefined
    const cancellationToken = randomUUID()

    try {
        session = await stripe.checkout.sessions.create(
            {
                mode: 'payment',
                locale,

                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: locale === 'en'
                                    ? '"Sicilia da vivere" booking'
                                    : 'Prenotazione "Sicilia da vivere"'
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
                `${config.siteUrl}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}`,

                cancel_url:
                `${config.siteUrl}/${locale}/booking/cancel?token=${cancellationToken}`
            },
            {
                idempotencyKey: `booking-${data.id}`
            }
        )

        if (!session.url) {
            throw new Error('Checkout URL missing')
        }

        const { error: saveError } = await supabase
            .from('bookings')
            .update({
                stripe_session_id: session.id,
                cancellation_token: cancellationToken
            })
            .eq('id', data.id)

        if (saveError) {
            throw saveError
        }

        return {
            id: data.id,
            departureId: data.departure_id,
            participants: data.participants,
            total: data.total_cents / 100,
            status: data.status,
            expiresAt: data.expires_at,
            checkoutUrl: session.url,
            checkoutSessionId: session.id
        }
    } catch (checkoutError) {
        console.error('Checkout creation failed:', checkoutError)

        let canRelease = false

        if (session) {
            try {
                const expiredSession =
                    await stripe.checkout.sessions.expire(session.id)

                canRelease = expiredSession.status === 'expired'
            } catch (expireError) {
                console.error('Unable to expire checkout:', expireError)
            }
        }

        if (canRelease) {
            const { error: cancelError } = await supabase
                .from('bookings')
                .update({
                    status: 'cancelled'
                })
                .eq('id', data.id)
                .eq('status', 'pending')

            if (cancelError) {
                console.error('Unable to release booking:', cancelError)
            }
        }

        throw createError({
            statusCode: 502,
            statusMessage: 'Unable to prepare payment'
        })
    }
})