import type { Experience } from '~~/shared/types/experience'

type TranslatedExperienceRow = {
  title: string
  description: string
  experiences: {
    id: number
    price_cents: number
    image_url: string
  }
}

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const locale = getQuery(event).locale ?? 'it'

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid experience ID'
    })
  }

  if (locale !== 'it' && locale !== 'en') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported locale'
    })
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('experience_translations')
    .select(`
      title,
      description,
      experiences!inner (
        id,
        price_cents,
        image_url
      )
    `)
    .eq('experience_id', id)
    .eq('locale', locale)
    .maybeSingle<TranslatedExperienceRow>()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load experience'
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Experience translation not found'
    })
  }

  const experience: Experience = {
    id: data.experiences.id,
    title: data.title,
    description: data.description,
    price: data.experiences.price_cents / 100,
    imageUrl: data.experiences.image_url
  }

  return experience
})