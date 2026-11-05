// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import packageReducer from '../features/packages/packageSlice';
import categoryReducer from '../features/categories/categorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    packages: packageReducer,
    categories: categoryReducer,
  },
});