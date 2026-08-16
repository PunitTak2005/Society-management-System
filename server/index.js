import bcrypt from 'bcrypt';



const data = [
  {
    name: 'Ritesh',
    email: 'ritesh@gmail.com',
    password: await bcrypt.hash('ritesh123', 12)
  },
];

console.log(data);


//NOTE role , update , get  , create 

//NOTE login ready , registration 

//NOTE error handler ;