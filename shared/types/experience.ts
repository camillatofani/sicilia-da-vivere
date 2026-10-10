export type Experience = {
  id: number
  title: string
  description: string
  price: number
  imageUrl: string
}

export type Departure = {
  id: number
  experienceId: number
  date: string
  time: string
  capacity: number
  available: number
}

export type Booking = {
  id: string
  departureId: number
  participants: number
  total: number
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  expiresAt: string
  checkoutUrl: string
}