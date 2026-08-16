import bcrypt from 'bcrypt' ;


export const generateHash = async(password)=> {
    return await bcrypt.hash(password , 12)
}

export const comparePassword = async(password , hashPassword) => {
    return await bcrypt.compare(password , hashPassword)
}