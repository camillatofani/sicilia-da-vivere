import { getSupabaseClient } from "../utils/supabase"

export default defineEventHandler(async () => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('experiences')
    .select('id, title, description, price_cents, image_url')
    .order('id')

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to load experiences'
    })
  }

  return data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price_cents / 100,
    imageUrl: item.image_url
  }))
})