import jwt from 'jsonwebtoken' ;


export const generateToken = (payload) => {
    return jwt.sign(payload , process.env.JWT_SECRET_STRING , {expiresIn : process.env.JWT_EXPIRES_IN} )
}
