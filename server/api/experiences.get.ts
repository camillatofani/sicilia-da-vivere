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
  const locale = getQuery(event).locale ?? 'it'

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
    .eq('locale', locale)
    .order('experience_id')

  if (error || !Array.isArray(data)) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load experiences'
    })
  }

  return data.map((item: TranslatedExperienceRow): Experience => ({
    id: item.experiences.id,
    title: item.title,
    description: item.description,
    price: item.experiences.price_cents / 100,
    imageUrl: item.experiences.image_url
  }))
})