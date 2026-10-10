import { getSupabaseClient } from "../../utils/supabase"

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid experience ID'
    })
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('experiences')
    .select('id, title, description, price_cents, image_url')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load experience'
    })
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Experience not found'
    })
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price_cents / 100,
    imageUrl: data.image_url
  }
})