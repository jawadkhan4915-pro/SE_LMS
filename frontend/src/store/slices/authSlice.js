import { createSlice } from '@reduxjs/toolkit';

// Safeguard check for token in local storage
const token = localStorage.getItem('token') || null;
const userJson = localStorage.getItem('user');
let user = null;

if (userJson) {
  try {
    user = JSON.parse(userJson);
  } catch (e) {
    localStorage.removeItem('user');
  }
}

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      const { token, ...user } = action.payload;
      state.user = user;
      state.token = token;
      state.error = null;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    authFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    }
  },
});

export const { authStart, authSuccess, authFailure, logoutUser, updateProfile } = authSlice.actions;
export default authSlice.reducer;
