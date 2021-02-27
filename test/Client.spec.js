const { Client } = require('..');
// const expect = require('chai').expect;
const config = require('./config/default.json');
describe('Login', () => {
	let cookie, studentCode, host;
	let client;
	beforeEach(() => {
		cookie = config.cookie;
		studentCode = config.studentCode;
		host = host;
		client = new Client(host);
	});
	it('login with hashed password', function (done) {
		this.timeout(5000);
		client
			.login(studentCode, config.passwordHashed, false)
			.then((logged) => {
				if (logged) done();
				else done(new Error('Not logged'));
			})
			.catch((e) => done(e));
	});
	it('login with password', function (done) {
		this.timeout(5000);
		client
			.login(studentCode, config.password, true)
			.then((logged) => {
				if (logged) done();
				else done(new Error('Not logged'));
			})
			.catch((e) => done(e));
	});
	it('login with cookie', function (done) {
		this.timeout(5000);
		client
			.login(cookie)
			.then((logged) => {
				if (logged) done();
				else done(new Error('Not logged'));
			})
			.catch((e) => done(e));
	});
});
