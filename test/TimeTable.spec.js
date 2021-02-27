const chai = require('chai');
const { Client } = require('..');
const { expect } = chai;
chai.use(require('chai-like'));
chai.use(require('chai-things'));
// const expect = require('chai').expect;
const config = require('./config/default.json');
describe('Student TimeTable', () => {
	before((done) => {
		client = new Client(config.host);
		client
			.login(config.cookie)
			.then((logged) => (logged ? done() : done(new Error())))
			.catch(done);
	});
	it('get semesters', function (done) {
		this.timeout(5000);
		client.studentTimeTable
			.showSemesters()
			.then((data) => {
				expect(data).to.be.an('array').that.contains.something.like({
					value: 'f85b945085ee4b8898a30165ca1833ff',
					name: '1_2018_2019',
				});
				done();
			})
			.catch(done);
	});
	it('get schedule', function (done) {
		this.timeout(5000);

		client
			.showTimeTable('2785c57c8f50480b91437980bb75f7ed')
			.then((data) => {
				expect(data).to.be.an('array').that.contains.something.like({
					day: '15/12/2020',
					subjectCode: 'CTCTKM12',
					subjectName: 'Phát triển phần mềm ứng dụng',
					className: 'Phát triển phần mềm ứng dụng-1-20 (C302.1)',
					teacher: '',
					lesson: '1,2,3',
					room: '204_TA4(THCNTT) TA4',
				});
				done();
			})
			.catch(done);
	});
});
