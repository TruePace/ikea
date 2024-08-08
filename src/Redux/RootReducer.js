import { combineReducers } from '@reduxjs/toolkit';
import notificationReducer from './Slices/NotificationSlice.js'

const rootReducer = combineReducers({
    notification: notificationReducer,
    // Add more reducers here as needed
  });
  
  export default rootReducer;