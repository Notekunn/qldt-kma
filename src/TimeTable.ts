import { Client } from './Client';
import { parseInitialFormData, parseSelector } from './utils';
import * as parser from 'parse-schedule-kma';
import { IStudentSchedule, IStudentSemester } from './@types/TimeTable';
export class TimeTable {
	client: Client;
	private readonly url: string = '/CMCSoft.IU.Web.Info/Reports/Form/StudentTimeTable.aspx';
	initSelectorField: any;
	constructor(client: Client) {
		this.client = client;
	}
	async showSemesters(): Promise<IStudentSemester[]> {
		const { data } = await this.client.api.get(this.url);
		const $ = <cheerio.Root>data;
		const semesters = Array.from($('select[name="drpSemester"] > option')).map((e) => ({
			value: $(e).attr('value'),
			name: $(e).text(),
		}));
		this.initSelectorField = parseSelector($);
		this.client.initialField = parseInitialFormData($);
		return semesters;
	}
	async showTimeTable(drpSemester: string): Promise<IStudentSchedule[]> {
		const form = {
			...this.initSelectorField,
			drpTerm: 1,
			drpType: 'B',
			btnView: 'Xuất file Excel',
			drpSemester: drpSemester || this.initSelectorField.drpSemester,
		};
		const response = await this.client.api.post(this.url, form, {
			transformResponse: [],
			responseType: 'arraybuffer',
		});
		const buffer = Buffer.from(response.data, 'binary');
		const { scheduleData } = await parser(buffer);
		const data = <IStudentSchedule[]>scheduleData;
		return data;
	}
}
