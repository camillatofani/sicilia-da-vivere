import type { Departure } from '~~/shared/types/experience'

export const departures: Omit<Departure, 'available'>[] = [
  {
    id: 1,
    experienceId: 1,
    date: '2026-10-20',
    time: '10:00',
    capacity: 8
  },
  {
    id: 2,
    experienceId: 1,
    date: '2026-10-22',
    time: '16:00',
    capacity: 6
  },
  {
    id: 3,
    experienceId: 2,
    date: '2026-10-21',
    time: '09:00',
    capacity: 10
  }
]