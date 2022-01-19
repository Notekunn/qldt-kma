import * as cheerio from 'cheerio'
export const configDefault = {
  host: 'http://qldt.actvn.edu.vn',
}

export const parseInitialFormData = ($: cheerio.Root) => {
  let form = $('form')
  let select = form.find('select')
  let input = form.find('input[type!="submit"][type!="checkbox"]')

  let data = {} as { [key: string]: string }

  input.each((i, elem) => {
    const inputName = $(elem).attr('name')
    const inputValue = $(elem).attr('value')
    if (inputName) data[inputName] = $(elem).attr('value') || ''
  })

  select.each((i, elem) => {
    const selectName = $(elem).attr('name')
    const selectValue = $(elem).find($('[selected="selected"]')).attr('value')
    if (selectName) data[selectName] = selectValue || ''
  })
  return data
}
export const parseSelector = ($: cheerio.Root) => {
  let data = {} as { [key: string]: string }
  let form = $('form')
  let select = form.find('select')

  select.each((i, elem) => {
    const options = $(elem).find($('option[selected]'))[0]
    if (!options) return
    const key = $(elem).attr('name') || ''
    data[key] = $(options).attr('value') || ''
  })
  // for (let key in data) {
  //     if (key.indexOf("btn") == 0) data[key] = undefined;
  // }

  return data
}
export const parseString = function (string: string) {
  let str = escape(string)
  str = str.replace(/%09+/g, '').replace(/^%0A+|%0A+$/g, '')
  return unescape(str).trim()
}
export const showError = function ($: cheerio.Root) {
  const error = $('#lblErrorInfo').text()
  if (error && error.trim()) return error.trim()
  return undefined
}
