import Role from '../model/role.model.js';
import User from '../model/user.model.js';
import { comparePassword, generateHash } from '../lib/hashPassword.js';
import { generatePassword } from '../lib/generatePassword.js';
import transporter from '../lib/sendMail.js';
//register
import { newUserRegistrationTemplate } from './../templates/NewUserRegistration.js';
import { generateToken } from '../lib/generateToken.js';
import { twoFactorOtpTemplate } from './../templates/twoFactorOtpTemplate.js';
export const register = async (req, res) => {
  try {
    const { name, email, phone, roleId, flatId } = req.body;

    const user = await User.findOne({ email });
    console.log(user);

    if (user) {
      return res.status(400).json({
        message: `User already exist with ${email}, Please try with another email`,
      });
    }

    const role = await Role.findById(roleId);
    console.log(role);

    if (role.role === 'resident') {
      if (!flatId) {
        return res.status(400).json({
          message: `flat details are required for the ${role.role}`,
        });
      }
    }
    const password = generatePassword(8);
    const hashPass = await generateHash(password);
    console.log(password, hashPass);

    const NewUser = await User.create({
      name,
      email,
      phone,
      role: roleId,
      password: hashPass,
      flat: role.role === 'resident' ? flatId : undefined,
    });

    const alluserData = await User.findById(NewUser._id).populate('role');
    console.log(alluserData);

    await transporter.sendMail({
      from: `SMS TEAM ${process.env.SMTP_USER}`,
      to: NewUser.email,
      subject: '',
      html: newUserRegistrationTemplate(password, NewUser.name),
    });

    res.status(201).json({
      message: 'success',
      data: alluserData,
    });
  } catch (error) {
    res.json({
      error: error.message,
    });
  }
};

//login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('role');
    console.log(user);
    if (!user) {
      return res.status(400).json({
        message: 'User is not registered , please register try again',
      });
    }
    console.log(password, user.password);
    const isPassword = await comparePassword(password, user.password);
    console.log(isPassword);
    if (!isPassword) {
      return res.status(401).json({
        message: 'Password is incorrect',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresIn = new Date(Date.now() + 5 * 60 * 1000);
    //update the current user document with generated otp and the otp expiry time
    user.otp = otp;
    user.otpExpiresIn = otpExpiresIn;

    //save the updated field in the db
    await user.save();

    console.log(user);

    //send the otp to the email addresss :
    await transporter.sendMail({
      from: `SMS TEAM ${process.env.SMTP_USER}`,
      to: user.email,
      subject: '',
      html: twoFactorOtpTemplate(user.otp, user.name),
    });

    // const payload = {
    //   id: user._id,
    //   name: user.name,
    //   email: user.email,
    //   role: user.role.role,
    // };
    // const token = generateToken(payload);
    // console.log(token);

    // res.cookie('token', token, {
    //   httpOnly: true,
    //   sameSite : 'lax',
    //   secure : false,
    //   maxAge : new Date(Date.now() + 24 * 60 * 60 * 1000),
    // });

    res.status(200).json({
      message: 'A verification email is sent to your registered email address',
      otpRequired: true,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).populate('role');

    console.log(user); //otp : '32232' , /otpExpires :

    if (!user.otp && user.otp !== otp && new Date() > user.otpExpiresIn) {
      return res.status(401).json({
        message: 'Invalid Otp or otp expired',
      });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.role,
    };
    const token = generateToken(payload);
    console.log(token);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Login Successfull',
    });
  } catch (error) {}
};

export const verify = async (req, res) => {
  console.log(req.user);

  res.status(200).json({
    authenticated: true,
    data: req.user,
  });
};

export const logout = async (req, res) => {
  try {
    res.cookie('token', null, {
      maxAge: 0,
    });

    res.status(200).json({
      authenticated: false,
      message: 'Logout successfull',
    });
  } catch (error) {}
};
// 1780644739844 => milliseconds

// 2min

// 2 mins mujhe convert hain milliseconds
