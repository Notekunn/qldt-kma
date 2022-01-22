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
