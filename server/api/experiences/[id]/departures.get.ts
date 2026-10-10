import type { Departure } from '~~/shared/types/experience'

type AvailabilityRow = {
  id: number
  experience_id: number
  date: string
  time: string
  capacity: number
  available: number
}

export default defineEventHandler(async (event) => {
  const experienceId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(experienceId) || experienceId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid experience ID'
    })
  }

  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .rpc('get_departure_availability', {
      p_experience_id: experienceId
    })

    if (error || !Array.isArray(data)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to load departures'
      })
    }

 return data.map((item: AvailabilityRow): Departure => ({
    id: item.id,
    experienceId: item.experience_id,
    date: item.date,
    time: item.time.slice(0, 5),
    capacity: item.capacity,
    available: item.available
  }))
})