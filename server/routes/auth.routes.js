import express from 'express' ;
import { register , login, verify, logout, verifyOtp } from '../controllers/auth.controller.js';
import verifyToken from '../middleware/verifyToken.js';
import { checkRole } from '../middleware/checkRole.js';


const route = express.Router() ; 
route.post('/register' , register) ;
route.post('/login' , login) ;
route.post('/verifyotp' , verifyOtp)
route.post('/verify' , verifyToken , checkRole(['admin' , 'resident']), verify)
route.post('/logout' , verifyToken , logout)
export default route ;




//client => theme => typography => 24px 20 16px 14px color platte  , api call , state management 
