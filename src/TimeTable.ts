import { Client } from './Client'
import { parseInitialFormData, parseSelector } from './utils'
import scheduleParser from './parser'
export interface IStudentSemester {
  value: string
  name: string
}

export interface IStudentSchedule {
  date: Date
  day: string
  subjectCode: string
  subjectName: string
  className: string
  teacher: string
  lesson: '1,2,3' | '4,5,6' | '7,8,9' | '10,11,12' | '13,14,15'
  room: string
}
export class TimeTable {
  client: Client
  private readonly url: string = '/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx'
  initSelectorField: any
  constructor(client: Client) {
    this.client = client
  }
  async showSemesters(): Promise<IStudentSemester[]> {
    const { data } = await this.client.api.get(this.url)
    const $ = <cheerio.Root>data
    const semesters = Array.from($('select[name="drpSemester"] > option')).map((e) => ({
      value: $(e).attr('value'),
      name: $(e).text(),
    })) as IStudentSemester[]
    this.initSelectorField = parseSelector($)
    this.client.initialField = parseInitialFormData($)
    return semesters
  }
  async showTimeTable(drpSemester: string): Promise<IStudentSchedule[]> {
    const form = {
      ...this.initSelectorField,
      drpTerm: 1,
      drpType: 'B',
      btnView: 'Xuất file Excel',
      drpSemester: drpSemester || this.initSelectorField.drpSemester,
    }
    const response = await this.client.api.post(this.url, form, {
      transformResponse: [],
      responseType: 'arraybuffer',
    })
    const buffer = Buffer.from(response.data, 'binary')
    const { scheduleData } = await scheduleParser(buffer)
    const data = <IStudentSchedule[]>scheduleData
    return data
  }
}
