import { IStudentProfile } from './Profile';
import { IStudentSchedule, IStudentSemester } from './TimeTable';
declare class Client {
	/**
	 * Init a client
	 * @param  {string} host? Host qldt
	 */
	constructor(host?: string);
	/**
	 * Login with cookie
	 * @param  {string} cookie Cookie of client
	 * @returns {Promise<boolean>} Login success or failed
	 */
	login(cookie: string): Promise<boolean>;
	/**
	 * Login with studentCode and password
	 * @param  {string} studentCode Student code
	 * @param  {string} password Pashword hashed or not
	 * @param  {boolean} shouldHash Should hash password
	 * @returns {Promise<boolean>} Login success or failed
	 */
	login(studentCode: string, password: string, shouldHash?: boolean): Promise<boolean>;
	/**
	 * Check login
	 * @returns {Promise<boolean>} Login success or failed
	 */
	checkLogin(): Promise<boolean>;
	/**
	 * show student Profile
	 * @returns {Promise<IStudentProfile>} Student info
	 */
	showProfile(): Promise<IStudentProfile>;
	/**
	 * Show semesters of student
	 * @returns {Promise<IStudentSemester[]>}
	 */
	showSemesters(): Promise<IStudentSemester[]>;
	/**
	 * Show time table of student
	 * @param {string} drpSemester
	 * @returns {Promise<IStudentSemester[]>}
	 */
	showTimeTable(drpSemester: string): Promise<IStudentSchedule[]>;
}
export { Client };
