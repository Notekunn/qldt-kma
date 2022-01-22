import { IStudentSchedule } from '../'
import xlsx from 'node-xlsx'
import { getAllDayBetween } from './time'

interface ParserResult {
  scheduleData: IStudentSchedule[]
  studentCode: string
  studentName: string
}
const validateSheet = (workSheet: string[][]) => {
  try {
    return (
      workSheet[0][0].toUpperCase() == 'BAN CƠ YẾU CHÍNH PHỦ' &&
      workSheet[1][0].toUpperCase() == 'HỌC VIỆN KỸ THUẬT MẬT MÃ' &&
      !!workSheet[5][5] &&
      !!workSheet[5][2]
    )
  } catch (error) {
    return false
  }
}
const getStudentCode = (workSheet: string[][]) => {
  return workSheet[5][5]
}
const getStudentName = (workSheet: string[][]) => {
  return workSheet[5][2]
}
const filterData = (item: string[]) => {
  return !!item[0] && (parseInt(item[0]) > 0 || item[0].toLowerCase() == 'thứ')
}
const fieldName = [
  'thứ',
  'mã học phần',
  'tên học phần',
  'lớp học phần',
  'cbgd',
  'tiết học',
  'phòng học',
  'thời gian học',
]
const parser = async (buffer: Buffer): Promise<ParserResult> => {
  try {
    const workSheet = xlsx.parse(buffer)[0].data as string[][]
    if (!validateSheet(workSheet))
      return Promise.reject(Error('Không phải thời khóa biểu học viện mật mã'))

    const studentCode = getStudentCode(workSheet)
    const studentName = getStudentName(workSheet)

    const [header, ...dataToParse] = workSheet.filter(filterData)
    const [
      dateIndex,
      subjectCodeIndex,
      subjectNameIndex,
      classNameIndex,
      teacherIndex,
      lessonIndex,
      roomIndex,
      timeIndex,
    ] = fieldName.map((field) => header.findIndex((e) => !!e && e.toLowerCase() === field))
    const scheduleData: IStudentSchedule[] = []
    for (const row of dataToParse) {
      const [timeStart, timeEnd] = row[timeIndex].split('-')
      const dates = getAllDayBetween(timeStart, timeEnd, parseInt(row[dateIndex]) || 1)
      for (const date of dates) {
        const dayOfWeek = date.getDay() == 0 ? 8 : date.getDay() + 1
        scheduleData.push({
          date,
          dayOfWeek: dayOfWeek,
          subjectCode: row[subjectCodeIndex],
          subjectName: row[subjectNameIndex],
          className: row[classNameIndex],
          teacher: row[teacherIndex],
          lesson: row[lessonIndex] as IStudentSchedule['lesson'],
          room: row[roomIndex],
        })
      }
    }

    return {
      scheduleData,
      studentCode,
      studentName,
    }
  } catch (error: any) {
    return Promise.reject(`Có lỗi xảy ra trong quá trình parse: ${error.message}`)
  }
}

export default parser
