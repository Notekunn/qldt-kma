import { formatDay, getAllDayBetween } from './time'

describe('getAllDayBetween', () => {
  it('should return all day between two date', () => {
    expect(getAllDayBetween('03/01/2022', '17/01/2022', 2).map(formatDay)).toEqual([
      '03/01/2022',
      '10/01/2022',
      '17/01/2022',
    ])
    expect(getAllDayBetween('07/01/2022', '28/01/2022', 6).map(formatDay)).toEqual([
      '07/01/2022',
      '14/01/2022',
      '21/01/2022',
      '28/01/2022',
    ])
  })
  it('should return empty if start date after ', () => {
    expect(getAllDayBetween('01/01/2020', '01/01/2020', 2)).toEqual([])
    expect(getAllDayBetween('02/01/2020', '01/01/2020', 2)).toEqual([])
    expect(getAllDayBetween('05/02/2020', '01/01/2020', 5)).toEqual([])
  })
})
