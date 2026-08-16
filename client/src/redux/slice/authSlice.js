import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import axios from 'axios';

const initialState = {
  loading: false,
  message: null,
  isAuthenticated: Cookies.get('isAuthenticated') || null,
  name: Cookies.get('name') || null,
  email: Cookies.get('email') || null,
  role:  Cookies.get('role') || null,
  profilePhoto: Cookies.get('profilePhoto') || null,
  error : null
};

export const login = createAsyncThunk(
  '/auth_login',
  async ({ formData }, thunkApi) => {
    try {
      console.log(formData);
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log(error.response.data);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  '/auth_verifyOtp',
  async ({ email, otp }, thunkApi) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verifyotp`,
        { email, otp },
        {
          withCredentials: true,
        }
      );

      const verifyRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify`,
        null,
        {
          withCredentials: true,
        }
      );

      console.log(verifyRes.data);
      return verifyRes.data;
    } catch (error) {
      console.log(error.response.data);
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

export const Signout = createAsyncThunk('/auth_logout', async(_ , thunkApi)=>{
try {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout` ,   null,
    {
      withCredentials: true,
    });
  return res.data
} catch (error) {

}
})

export const updateSelfProfileThunk = createAsyncThunk(
  '/auth_updateSelfProfile',
  async (formData, thunkApi) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile`,
        formData,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response.data);
    }
  }
);

const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    updateProfilePhotoSuccess: (state, action) => {
      state.profilePhoto = action.payload;
      Cookies.set('profilePhoto', action.payload || '');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateSelfProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSelfProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        const { name, email } = action.payload.data;
        state.name = name;
        state.email = email;
        Cookies.set('name', name);
        Cookies.set('email', email);
      })
      .addCase(updateSelfProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        console.log(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtp.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.authenticated;
        const { name, email, role, id, profilePhoto } = action.payload.data;
        state.name = name;
        state.role = role;
        state.email = email;
        state.profilePhoto = profilePhoto;
        Cookies.set('name', name);
        Cookies.set('email', email);
        Cookies.set('id', id);
        Cookies.set('role', role);
        Cookies.set('profilePhoto', profilePhoto || '');
        Cookies.set('isAuthenticated', action.payload.authenticated);
        console.log(state.email, state.role, state.isAuthenticated, state.name);
        console.log(action.payload);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(Signout.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload);
      })
      .addCase(Signout.pending, (state, action) => {

      })
      .addCase(Signout.fulfilled, (state, action) => {
        console.log(action.payload);
        state.isAuthenticated = action.payload.authenticated;
        Cookies.remove('isAuthenticated');
        state.name = null;
        state.email = null;
        state.role = null;
        state.profilePhoto = null;

        Cookies.remove('name');
        Cookies.remove('email');
        Cookies.remove('role');
        Cookies.remove('profilePhoto');
        Cookies.remove('id');
      });
  },
});

export const { updateProfilePhotoSuccess } = authSlice.actions;
export default authSlice.reducer;

//state variable fetch  //set

//api calling => async operation  thunks

//redux toolkit working flow  ?
//thunk api toolkit ?
//extraReducer ?


//NOTE assign resident to flat  ;

//user id => client get => flat ki id
//get unassigned flat  ;
//role fetch => dropdown main user registration form k andar
//fields => dropdown shows list of unassigned flat ;

//NOTE get available flat

//role slice  thunks
//flat slice  thunks
