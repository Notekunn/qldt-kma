# TIN-CHI-KMA

Module tích hợp để tương tác với hệ thống đăng ký tín chỉ của CMCSoft .
Ví dụ:

[ĐẠI HỌC HÀNG HẢI](http://dktt.vimaru.edu.vn/CMCSoft.IU.Web.info/Login.aspx)

[ĐẠI HỌC VINH](http://student.vinhuni.edu.vn/cmcsoft.iu.web.info/)

...

## CÀI ĐẶT

Cài từ npmjs:

```bash
npm install --save @notekunn/qldt-kma
```

Cài từ github:

```bash
npm install --save Notekunn/qldt-kma
```

## KHỞI TẠO

`HOST_API` chính là phần url trước `CMCSoft.IU.Web.info` không bao gồm dấu `/`.

Khởi tạo api như sau:

```javascript{2}
const { Client } = require('@notekunn/qldt-kma');
const client = new Client('HOST_API');
async function main(){
    // Do some thing here
}
main();
```

## LOGIN

Đăng nhập vào trang đăng ký tín chỉ.

### Login bằng cookie

Sử dụng cookie có sẵn để đăng nhập

```javascript
async function main(){
    const cookie = 'a=1;b=2';
    const loginSuccess = await client.login(cookie);
    if(loginSuccess) return;
}
main();
```

### Login bằng password

Sử dụng mã sinh viên và mật khẩu

```javascript
async function main(){
    const shouldHash = true; //True nếu mật khẩu chưa hash
    const loginSuccess = await client.login('CT0.....', 'matkhau', true);
    if(loginSuccess) return;
}
main();
```

## CÁC API

### client.showProfile

Lấy thông tin sinh viên

```javascript
const info = await client.showProfile();
/**
{
    displayName: string;
    studentCode: string;
    gender: 'Nam' | 'Nữ';
    birthday: string;
}
*/
```

### client.showSemesters

Lấy thông tin các học kỳ

```javascript
const semesters = await client.showSemesters();
/**
[{
	value: string;// drpSemester
	name: string;
}]
*/    
```

### client.showTimeTable

Lấy thông tin thời khóa biểu của sinh viên

```javascript
const schedule = await client.showTimeTable(drpSemester);
/**
[{
	day: string;
	subjectCode: string;
	subjectName: string;
	className: string;
	teacher: string;
	lesson: '1,2,3' | '4,5,6' | '7,8,9' | '10,11,12' | '13,14,15';
	room: string;
}]
*/
```
