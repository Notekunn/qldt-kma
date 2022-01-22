import { Client } from './'
describe('Login', () => {
  const { studentCode = '', password = '', passwordHashed = '' } = process.env
  let client: Client
  let cookie: string
  beforeEach(() => {
    client = new Client('', true)
    // cookie = client.getCookie()
  })

  it('login with password', function (done) {
    client
      .loginWithPassword(studentCode, password)
      .then((result) => {
        expect(result.status).toBe('success')
        expect(result.fields).toBeDefined()
        done()
      })
      .catch(done)
  })

  it('login with wrong password', function (done) {
    client
      .loginWithPassword(studentCode, 'wrong password')
      .then((result) => {
        expect(result.status).toBe('error')
        expect(result.fields).toBeUndefined()
        done()
      })
      .catch(done)
  })

  it('login with password hashed', function (done) {
    client
      .loginWithPassword(studentCode, passwordHashed, false)
      .then((result) => {
        expect(result.status).toBe('success')
        expect(result.fields).toBeDefined()
        done()
      })
      .catch(done)
  })
})
