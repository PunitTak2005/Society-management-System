export const generatePassword = (length) => {
let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%$!#&*'
console.log(str.length)

let password = ''  ;
for(let i = 0  ;  i <= length ; i++){

password += str[Math.floor(Math.random() * 68)]


}
return password
}
generatePassword()



