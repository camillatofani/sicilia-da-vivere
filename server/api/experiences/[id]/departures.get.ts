import { departures } from '../../../data/departure'

export default defineEventHandler((event) => {
  const experienceId = Number(getRouterParam(event, 'id'))

  return departures.filter(
    departure => departure.experienceId === experienceId
  )
})