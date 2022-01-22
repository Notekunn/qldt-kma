import { Client } from './'

describe('Login', () => {
  const { studentCode = '', password = '', passwordHashed = '' } = process.env
  let client: Client
  let cookie: string
  beforeEach(() => {
    client = new Client('', true)
    // cookie = client.getCookie()
  })

  it('login with password', async function () {
    const result = await client.loginWithPassword(studentCode, password)
    expect(result.status).toBe('success')
    expect(result.fields).toBeDefined()
  })

  it('login with wrong password', async function () {
    const result = await client.loginWithPassword(studentCode, 'wrong password')
    expect(result.status).toBe('error')
    expect(result.fields).toBeUndefined()
  })

  it('login with password hashed', async function () {
    const result = await client.loginWithPassword(studentCode, passwordHashed, false)
    expect(result.status).toBe('success')
    expect(result.fields).toBeDefined()
  })

  it('login with cookie', async function () {
    const result = await client.loginWithPassword(studentCode, password)
    expect(result.status).toBe('success')
    const cookie = client.getCookie()
    expect(cookie).toBeDefined()
    const result2 = await client.loginWithCookie(cookie)
    expect(result2.status).toBe('success')
  })
})

describe('Profile', () => {
  const { studentCode = '', password = '', studentName = '' } = process.env
  let client: Client
  let cookie: string
  beforeAll(async () => {
    client = new Client()
    const result = await client.loginWithPassword(studentCode, password)
    cookie = client.getCookie()
  })

  it('show profile', async function () {
    const profile = await client.getProfile(cookie)
    expect(profile).toBeDefined()
    expect(profile.displayName).toEqual(studentName)
    expect(profile.studentCode).toEqual(studentCode)
  })
})

describe('Schedule', () => {
  const { studentCode = '', password = '', studentName = '' } = process.env
  let client: Client
  let cookie: string
  beforeAll(async () => {
    client = new Client()
    const result = await client.loginWithPassword(studentCode, password)
    cookie = client.getCookie()
  })

  it('show semesters', async function () {
    const result = await client.getSemesters(cookie)
    expect(result).toBeDefined()
    expect(result.fields).toBeDefined()
    expect(result.semesters).not.toHaveLength(0)
  })

  it('show schedule', async function () {
    const result = await client.getSemesters(cookie)
    const semester = result.semesters[1]
    const result2 = await client.getSchedule(cookie, result.fields, semester.value)
    expect(result2).toBeDefined()
    expect(result2).not.toHaveLength(0)
    expect(result2[0].date).toBeInstanceOf(Date)
    expect(result2[0].dayOfWeek).toBeGreaterThanOrEqual(2)
    expect(result2[0].dayOfWeek).toBeLessThanOrEqual(8)
  })
})
