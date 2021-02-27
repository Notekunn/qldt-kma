import { Client } from './Client';
import { IStudentProfile } from './@types/Profile';
export class Profile {
	client: Client;
	private readonly url: string = '/CMCSoft.IU.Web.Info/StudentProfileNew/HoSoSinhVien.aspx';
	constructor(client: Client) {
		this.client = client;
	}
	async showProfile(): Promise<IStudentProfile> {
		const { data: $ } = await this.client.api.get(this.url);
		const displayName =
			($('input[name="txtHoDem"]').val() || '') + ' ' + ($('input[name="txtTen"]').val() || '');
		const studentCode = $('input[name="txtMaSV"]').val() || '';
		const gender = $('select[name="drpGioiTinh"] > option[selected]').text();
		const birthday = $('input[name="txtNgaySinh"]').val() || '';
		const information: IStudentProfile = {
			displayName,
			studentCode,
			gender,
			birthday,
		};
		return information;
	}
}
