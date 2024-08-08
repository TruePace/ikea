import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './RootReducer.js';

const store = configureStore({
  reducer: rootReducer,
});

export default store;