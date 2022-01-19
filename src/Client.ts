import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import * as qs from 'qs'
import md5 from 'md5'
import { parseInitialFormData, configDefault } from './utils'
import { Profile } from './Profile'
import { TimeTable } from './TimeTable'
type ObjectDictionary<T = any> = { [key: string]: T }
class Client {
  cookie: string = ''
  initialField: ObjectDictionary<string> = {}
  host: string
  api: AxiosInstance
  studentProfile: Profile
  studentTimeTable: TimeTable
  constructor(host?: string) {
    this.host = host ? host.trim() : configDefault.host
    this.api = axios.create({
      headers: {
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36',
      },
      transformResponse: (res) => {
        const $ = cheerio.load(res)
        return $
      },
      maxRedirects: 0,
      validateStatus: (status) => {
        return status < 400
      },
    })
    this.api.interceptors.request.use((data) => {
      if (data.url && !data.url.startsWith(this.host)) {
        data.url = this.host + data.url
      }
      if (this.cookie /* && data.method.toLowerCase() == 'post' */) {
        data.headers = {
          ...data.headers,
          Cookie: this.cookie,
        }
      }
      if (data.method == 'post' || data.method == 'POST') {
        data.data = qs.stringify({
          ...this.initialField,
          ...data.data,
        })
      }
      return data
    })
    this.studentProfile = new Profile(this)
    this.studentTimeTable = new TimeTable(this)
  }
  async login(studentCode: string, password?: string, shouldHash = true): Promise<boolean> {
    await this.initField()
    if (!studentCode) throw new Error('You need to specify student code and password or cookie')
    if (password) {
      const txtUserName = studentCode.trim()
      const txtPassword = shouldHash ? md5(password) : password
      const form = {
        txtUserName,
        txtPassword,
        hidUserId: '',
        hidUserFullName: '',
        hidTrainingSystemId: '',
        btnSubmit: 'Đăng+nhập',
      }
      const { data: $, headers } = await this.api.post(`/CMCSoft.IU.Web.info/Login.aspx`, form)
      this.cookie = headers['set-cookie']?.join(';') || ''
    } else {
      this.cookie = studentCode // cookie
    }
    return this.checkLogin()
  }

  async initField() {
    const { data: $ } = await this.api.get(`/CMCSoft.IU.Web.info/Login.aspx`)
    this.initialField = parseInitialFormData($)
    return this
  }

  async checkLogin(): Promise<boolean> {
    if (!this.cookie) return false
    const { data } = await this.api.get(`/CMCSoft.IU.Web.Info/Home.aspx`)
    const $ = <cheerio.Root>data
    const role = $('#PageHeader1_lblUserRole').html()
    return !!role
  }

  getCookie(): string {
    return this.cookie
  }

  showProfile() {
    return this.studentProfile.showProfile()
  }

  showSemesters() {
    return this.studentTimeTable.showSemesters()
  }

  showTimeTable(drpSemester: string) {
    return this.studentTimeTable.showTimeTable(drpSemester)
  }
}

export { Client }
