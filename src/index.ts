import axios, { AxiosInstance, AxiosResponse } from 'axios'
import cheerio, { CheerioAPI } from 'cheerio'
import md5 from 'md5'
import qs from 'qs'
import fs from 'fs'
import scheduleParser from './parser'
export interface IStudentProfile {
  displayName: string
  studentCode: string
  gender: string
  birthday: string
}

export interface IStudentSemester {
  value: string
  name: string
}

export interface IStudentSchedule {
  date: Date
  dayOfWeek: number
  subjectCode: string
  subjectName: string
  className: string
  teacher: string
  lesson: '1,2,3' | '4,5,6' | '7,8,9' | '10,11,12' | '13,14,15'
  room: string
}

export interface ILoginResult {
  status: 'success' | 'error'
  message: string
  fields?: Record<string, string>
}
class HttpException extends Error {
  status: number
  message: string
  constructor(status: number, message?: string) {
    super(message)
    this.status = status
    this.message = message || ''
  }
}

export class Client {
  private cookie: string = ''
  private host: string = 'http://qldt.actvn.edu.vn'
  private api: AxiosInstance
  private debugMode: boolean = false
  constructor(host?: string, debug: boolean = false) {
    if (!!host) this.host = host
    this.api = this.generateAxiosInstance()
    this.debugMode = debug
  }

  async loginWithPassword(
    studentCode: string,
    password: string,
    shouldHashPassword: boolean = true
  ): Promise<ILoginResult> {
    try {
      const { data: preLoginData } = await this.api.get('/CMCSoft.IU.Web.info/Login.aspx')
      const otherField = this.extractInitField(preLoginData)
      const txtPassword = shouldHashPassword ? md5(password) : password
      const txtUserName = this.formatString(studentCode)
      const formData = {
        ...otherField,
        txtUserName,
        txtPassword,
        hidUserId: '',
        hidUserFullName: '',
        hidTrainingSystemId: '',
        btnSubmit: 'Đăng+nhập',
      }
      const { data: loginData, headers } = await this.api.post(
        '/CMCSoft.IU.Web.info/Login.aspx',
        formData
      )
      const errorMessage = this.showError(loginData)
      if (errorMessage) throw new Error(errorMessage)
      this.cookie = headers['set-cookie']?.join(';') || ''
      const loginResult = await this.checkLogin()
      return {
        status: loginResult.status ? 'success' : 'error',
        message: loginResult.status
          ? 'Login with password successfully'
          : 'Login with password failed',
        fields: loginResult.fields,
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message || 'Cannot connect to CMC System',
      }
    }
  }

  async loginWithCookie(cookie: string): Promise<ILoginResult> {
    this.cookie = cookie
    const loginResult = await this.checkLogin()
    return {
      status: loginResult.status ? 'success' : 'error',
      message: loginResult.status ? 'Login with cookie successfully' : 'Login with cookie failed',
      fields: loginResult.fields,
    }
  }

  getCookie() {
    return this.cookie
  }

  async getProfile(cookie: string): Promise<IStudentProfile> {
    const loginData = await this.loginWithCookie(cookie)
    if (loginData.status !== 'success') throw new HttpException(401, 'Login failed')
    const PROFILE_URL = '/CMCSoft.IU.Web.Info/StudentProfileNew/HoSoSinhVien.aspx'
    const { data: $ } = (await this.api.get(PROFILE_URL)) as AxiosResponse<CheerioAPI>
    const firstName = this.formatString($('input[name="txtTen"]').val() as string)
    const lastName = this.formatString($('input[name="txtHoDem"]').val() as string)
    const displayName = [lastName, firstName].join(' ')
    const studentCode = $('input[name="txtMaSV"]').val() as string
    const gender = $('select[name="drpGioiTinh"] > option[selected]').text()
    const birthday = $('input[name="txtNgaySinh"]').val() as string
    return {
      displayName,
      studentCode,
      gender,
      birthday,
    }
  }

  async getSemesters(cookie: string) {
    const loginData = await this.loginWithCookie(cookie)
    if (loginData.status !== 'success') throw new HttpException(401, 'Login failed')
    const SEMESTER_URL = '/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx'
    const { data: $ } = (await this.api.get(SEMESTER_URL)) as AxiosResponse<CheerioAPI>
    const semesterSelector = Array.from($('select[name="drpSemester"] > option'))
    const semesters: IStudentSemester[] = semesterSelector.map((e) => ({
      value: $(e).attr('value') || '',
      name: $(e).text(),
    }))
    const fields: Record<string, string> = {
      ...this.extractInitField($),
      ...this.extractSelector($),
    }
    return {
      semesters,
      fields,
    } as const
  }

  async getSchedule(cookie: string, preFields: Record<string, string>, drpSemester: string) {
    const formData = {
      ...preFields,
      drpTerm: 1,
      drpType: 'B',
      btnView: 'Xuất file Excel',
      drpSemester: drpSemester || preFields.drpSemester,
    }
    const SEMESTER_URL = '/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx'
    const response = await this.api.post(SEMESTER_URL, formData, {
      transformResponse: [],
      responseType: 'arraybuffer',
    })
    const buffer = Buffer.from(response.data, 'binary')
    const { scheduleData } = await scheduleParser(buffer)
    return scheduleData
  }

  private async checkLogin(): Promise<{ status: boolean; fields?: Record<string, string> }> {
    if (!this.cookie)
      return {
        status: false,
      }
    try {
      const { data: homeData } = await this.api.get(`/CMCSoft.IU.Web.Info/Home.aspx`)
      const role = this.getRole(homeData)
      if (!role) {
        return {
          status: false,
        }
      }
      return {
        status: true,
        fields: this.extractInitField(homeData),
      }
    } catch (error) {
      return {
        status: false,
      }
    }
  }

  private generateAxiosInstance(): AxiosInstance {
    const api = axios.create({
      baseURL: this.host,
      headers: {
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
      },

      maxRedirects: 0,
      validateStatus: (status) => {
        return status < 400
      },
      transformResponse: (res) => {
        if (this.debugMode) {
          fs.writeFileSync(`./coverage/debug-${new Date().getTime()}.html`, res)
        }
        return cheerio.load(res)
      },
    })
    api.interceptors.request.use((config) => {
      if (this.cookie) {
        config.headers = {
          ...config.headers,
          Cookie: this.cookie,
        }
      }
      if (config.method == 'post' || config.method == 'POST') {
        config.data = qs.stringify(config.data)
      }
      return config
    })
    // api.interceptors.response.use((response) => {
    //   const $ = cheerio.load(response.data)
    //   return $
    // })
    return api
  }

  private formatString(text: string): string {
    return text.replace(/\n/g, '').replace(/\s+/g, ' ').trim()
  }

  private showError($: CheerioAPI) {
    const error = $('#lblErrorInfo').text()
    return this.formatString(error)
  }

  private extractInitField($: CheerioAPI): Record<string, string> {
    const form = $('form')
    const select = form.find('select')
    const input = form.find('input[type!="submit"][type!="checkbox"]')

    const data: Record<string, string> = {}

    input.each((i, elem) => {
      const inputName = $(elem).attr('name')
      const inputValue = $(elem).attr('value')
      if (inputName) data[inputName] = inputValue || ''
    })

    select.each((i, elem) => {
      const selectName = $(elem).attr('name')
      const selectValue = $(elem).find($('[selected="selected"]')).attr('value')
      if (selectName) data[selectName] = selectValue || ''
    })
    return data
  }

  private extractSelector($: CheerioAPI): Record<string, string> {
    const data: Record<string, string> = {}
    const form = $('form')
    const select = form.find('select')

    select.each((i, elem) => {
      const options = $(elem).find($('option[selected]'))[0]
      if (!options) return
      const key = $(elem).attr('name') || ''
      data[key] = $(options).attr('value') || ''
    })
    return data
  }

  private getRole($: CheerioAPI): string {
    const role = $('#PageHeader1_lblUserRole').text()
    return this.formatString(role)
  }
}
