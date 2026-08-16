import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  bills: [],
  stats: null,
  loading: false,
  error: null,
  message: null,
  totalResults: 0,
  totalPages: 1,
  page: 1,
  limit: 10,
};

export const fetchBills = createAsyncThunk(
  'bill/fetchBills',
  async (params = {}, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/bills`, {
        params,
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createBill = createAsyncThunk(
  'bill/createBill',
  async (billData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/bills`,
        billData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const payBill = createAsyncThunk(
  'bill/payBill',
  async ({ id, paymentMethod }, thunkApi) => {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/bills/${id}/pay`,
        { paymentMethod },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBillStats = createAsyncThunk(
  'bill/fetchBillStats',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/bills/stats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    clearBillError: (state) => {
      state.error = null;
    },
    clearBillMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload.data;
        state.totalResults = action.payload.totalResults || action.payload.data?.length || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.page = action.payload.page || 1;
        state.limit = action.payload.limit || 10;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBill.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills.unshift(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(payBill.pending, (state) => {
        state.loading = true;
      })
      .addCase(payBill.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bills.findIndex((b) => b._id === action.payload.data._id);
        if (index !== -1) {
          state.bills[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(payBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBillStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBillStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchBillStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBillError, clearBillMessage } = billSlice.actions;
export default billSlice.reducer;
