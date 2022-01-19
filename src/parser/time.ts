import moment from 'moment'

export const getAllDayBetween = (start: string, end: string, dateOfWeek: number): Date[] => {
  const dateStart = moment(start, 'DD/MM/YYYY')
  const dateEnd = moment(end, 'DD/MM/YYYY')
  // Find first day in date of week
  let i = (dateOfWeek - 1) % 7
  const dates: Date[] = []
  while (true) {
    const currentDate = dateStart.day(i)
    if (currentDate.isAfter(dateEnd)) return dates
    // Check ngay dau tien
    if (currentDate.isAfter(dateStart)) dates.push(currentDate.toDate())
    i = i + 7
  }
}
