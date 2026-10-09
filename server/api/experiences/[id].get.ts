import { experiences } from '../../data/experiences'

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))

  const experience = experiences.find(item => item.id === id)

  if (!experience) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Experience not found'
    })
  }

  return experience
})