import * as cheerio from 'cheerio';
export const configDefault = {
	host: 'http://qldt.actvn.edu.vn',
};

export const parseInitialFormData = ($: cheerio.Root) => {
	let form = $('form');
	let select = form.find('select');
	let input = form.find('input[type!="submit"][type!="checkbox"]');

	let data = {};

	input.each((i, elem) => {
		if ($(elem).attr('name')) data[$(elem).attr('name')] = $(elem).attr('value') || '';
	});

	select.each((i, elem) => {
		if ($(elem).attr('name'))
			data[$(elem).attr('name')] = $(elem).find($('[selected="selected"]')).attr('value');
	});
	return data;
};
export const parseSelector = ($: cheerio.Root) => {
	let data = {};
	let form = $('form');
	let select = form.find('select');

	select.each((i, elem) => {
		let options = $(elem).find($('option[selected]'))[0];
		// let cooked_options = options.find((option) => $(option).attr('selected') ? true: false)[0];

		data[$(elem).attr('name')] = (options && $(options).attr('value')) || undefined;
	});
	// for (let key in data) {
	//     if (key.indexOf("btn") == 0) data[key] = undefined;
	// }

	return data;
};
export const parseString = function (string: string) {
	let str = escape(string);
	str = str.replace(/%09+/g, '').replace(/^%0A+|%0A+$/g, '');
	return unescape(str).trim();
};
export const showError = function ($) {
	const error = $('#lblErrorInfo').text();
	if (error && error.trim()) return error.trim();
	return undefined;
};
