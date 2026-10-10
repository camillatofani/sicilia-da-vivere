import { getSupabaseClient } from "../../../utils/supabase"

export default defineEventHandler(async (event) => {
  const experienceId = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(experienceId) || experienceId <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid experience ID'
    })
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('departures')
    .select('id, experience_id, date, time, capacity')
    .eq('experience_id', experienceId)
    .order('date')
    .order('time')

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load departures'
    })
  }

  return data.map(item => ({
    id: item.id,
    experienceId: item.experience_id,
    date: item.date,
    time: item.time.slice(0, 5),
    capacity: item.capacity
  }))
})