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
}