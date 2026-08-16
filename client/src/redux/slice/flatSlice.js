import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Cookie } from 'lucide-react';
import Cookies from 'js-cookie'
const initialState = {
  flats: [],
flat : null ,
  loading: false,
  error: null,
  message: null,
};

// Fetch all flats
export const fetchFlats = createAsyncThunk(
  'flat/fetchFlats',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/flats`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch available flats
export const fetchAvailableFlats = createAsyncThunk(
  'flat/fetchAvailableFlats',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/flats/available`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);


export const getResidentFlat = createAsyncThunk(
  'flat/getResidentFlat',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/flats/${Cookies.get('id')}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new flat
export const createFlat = createAsyncThunk(
  'flat/createFlat',
  async (flatData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/flats`,
        flatData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update a flat
export const updateFlat = createAsyncThunk(
  'flat/updateFlat',
  async ({ id, flatData }, thunkApi) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/flats/${id}`,
        flatData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a flat
export const deleteFlat = createAsyncThunk(
  'flat/deleteFlat',
  async (id, thunkApi) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/flats/${id}`,
        { withCredentials: true }
      );
      return { id, message: response.data.message };
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const flatSlice = createSlice({
  name: 'flat',
  initialState,
  reducers: {
    clearFlatError: (state) => {
      state.error = null;
    },
    clearFlatMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Flats
      .addCase(fetchFlats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlats.fulfilled, (state, action) => {
        state.loading = false;
        state.flats = action.payload.data;
      })
      .addCase(fetchFlats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Available Flats
      .addCase(fetchAvailableFlats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableFlats.fulfilled, (state, action) => {
        state.loading = false;
        state.flats = action.payload.data;
      })
      .addCase(fetchAvailableFlats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Flat
      .addCase(createFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFlat.fulfilled, (state, action) => {
        state.loading = false;
        state.flats.push(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createFlat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Flat
      .addCase(updateFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFlat.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.flats.findIndex(
          (flat) => flat._id === action.payload.data._id
        );
        if (index !== -1) {
          state.flats[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateFlat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Flat
      .addCase(deleteFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFlat.fulfilled, (state, action) => {
        state.loading = false;
        state.flats = state.flats.filter((flat) => flat._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteFlat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) .addCase(getResidentFlat.pending, (state) => {
        state.loading = true;
      })
      .addCase(getResidentFlat.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
       state.flat = action.payload
        state.message = action.payload.message;
      })
      .addCase(getResidentFlat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFlatError, clearFlatMessage } = flatSlice.actions;
export default flatSlice.reducer;
