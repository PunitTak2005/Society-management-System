import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  roles: [],
  loading: false,
  error: null,
  message: null,
};

// Fetch all roles
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (_, thunkApi) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/roles`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create a new role
export const createRole = createAsyncThunk(
  'role/createRole',
  async (roleData, thunkApi) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/roles`,
        roleData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update a role
export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, roleData }, thunkApi) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/roles/${id}`,
        roleData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a role
export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id, thunkApi) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/roles/${id}`,
        { withCredentials: true }
      );
      return { id, message: response.data.message };
    } catch (error) {
      return thunkApi.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
    clearRoleMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Roles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.data;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles.push(action.payload.data);
        state.message = action.payload.message;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.roles.findIndex(
          (role) => role._id === action.payload.data._id
        );
        if (index !== -1) {
          state.roles[index] = action.payload.data;
        }
        state.message = action.payload.message;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = state.roles.filter((role) => role._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRoleError, clearRoleMessage } = roleSlice.actions;
export default roleSlice.reducer;
