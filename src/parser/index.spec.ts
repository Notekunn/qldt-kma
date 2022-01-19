import parseSchedule from './'
import fs from 'fs'
import path from 'path'

describe('parseSchedule()', () => {
  let buffer: Buffer

  it('should return schedule data with validate sheet', (done) => {
    buffer = fs.readFileSync(path.resolve(__dirname, '../../data/valid-sheet.xls'))
    parseSchedule(buffer)
      .then((data) => {
        expect(data.scheduleData).toHaveLength(116)
        done()
      })
      .catch(done)
  })

  it('should throw Error with non xls file', (done) => {
    buffer = fs.readFileSync(path.resolve(__dirname, '../../data/non-sheet.xls'))
    parseSchedule(buffer)
      .then(() => {
        done(new Error('Should throw Error with non xls file'))
      })
      .catch((e) => {
        done()
      })
    // expect(parseSchedule(buffer)).rejects.toThrowError('Không phải thời khóa biểu học viện mật mã')
  })

  it('should throw error with invalid sheet', async () => {
    buffer = fs.readFileSync(path.resolve(__dirname, '../../data/invalid-sheet.xls'))
    await expect(parseSchedule(buffer)).rejects.toThrowError(
      'Không phải thời khóa biểu học viện mật mã'
    )
  })
})
