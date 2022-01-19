import { Client } from './Client'
describe('Login', () => {
  const { studentCode = '', password = '', passwordHashed = '' } = process.env
  let client: Client
  let cookie: string
  beforeEach(() => {
    client = new Client()
  })
  it('login with hashed password', function (done) {
    jest.setTimeout(10000)
    client
      .login(studentCode, passwordHashed, false)
      .then((logged) => {
        if (logged) done()
        else done(new Error('Not logged'))
      })
      .catch((e) => done(e))
  })
  it('login with password', function (done) {
    jest.setTimeout(10000)
    client
      .login(studentCode, password, true)
      .then((logged) => {
        if (logged) done()
        else done(new Error('Not logged'))
      })
      .catch((e) => done(e))
  })
  //   it('login with cookie', function (done) {
  //     client
  //       .login(cookie)
  //       .then((logged) => {
  //         if (logged) done()
  //         else done(new Error('Not logged'))
  //       })
  //       .catch((e) => done(e))
  //   })
})
