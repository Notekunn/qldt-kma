const { expect } = require('chai');
const { Client } = require('../lib');
// const expect = require('chai').expect;
const config = require('./config/default.json');
describe('Student Profile', () => {
	before((done) => {
		client = new Client(config.host);
		client
			.login(config.cookie)
			.then((logged) => (logged ? done() : done(new Error())))
			.catch(done);
	});
	it('get info student', function (done) {
		this.timeout(5000);
		client.showProfile().then((data) => {
			if (data.studentCode) done();
			else done(new Error());
		});
	});
});
