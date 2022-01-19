import { IStudentSchedule } from '../TimeTable'
import xlsx from 'node-xlsx'

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
    scheduleData.push({
      subjectName: row[subjectNameIndex],
      subjectCode: row[subjectCodeIndex],
      className: row[classNameIndex],
      teacher: row[teacherIndex],
      room: row[roomIndex],
      lesson: row[lessonIndex] as IStudentSchedule['lesson'],
      day: row[dateIndex],
      date: new Date(),
    })
  }

  return {
    scheduleData: [],
    studentCode,
    studentName,
  }
}

export default parser
