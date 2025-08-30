// Redux/Slices/MissedNotificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hasMissedContent: false,
  missedContentCount: 0,
  lastChecked: null,
  isChecking: false
};

const missedNotificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setHasMissedContent: (state, action) => {
      state.hasMissedContent = action.payload;
      console.log('🔔 Redux: Set hasMissedContent to:', action.payload);
    },
    setMissedContentCount: (state, action) => {
      const newCount = Math.max(0, action.payload); // Ensure count is never negative
      state.missedContentCount = newCount;
      state.hasMissedContent = newCount > 0;
      state.lastChecked = new Date().toISOString();
      console.log('🔔 Redux: Set missedContentCount to:', newCount);
    },
    resetMissedContentCount: (state) => {
      state.hasMissedContent = false;
      state.missedContentCount = 0;
      state.lastChecked = new Date().toISOString();
      console.log('🔔 Redux: Reset missed content notification');
    },
    setIsChecking: (state, action) => {
      state.isChecking = action.payload;
    },
    incrementMissedContentCount: (state) => {
      state.missedContentCount += 1;
      state.hasMissedContent = true;
      console.log('🔔 Redux: Incremented missedContentCount to:', state.missedContentCount);
    },
    decrementMissedContentCount: (state) => {
      if (state.missedContentCount > 0) {
        state.missedContentCount -= 1;
        state.hasMissedContent = state.missedContentCount > 0;
        console.log('🔔 Redux: Decremented missedContentCount to:', state.missedContentCount);
      }
    }
  },
});

export const { 
  setHasMissedContent, 
  setMissedContentCount, 
  resetMissedContentCount,
  setIsChecking,
  incrementMissedContentCount,
  decrementMissedContentCount
} = missedNotificationSlice.actions;

export default missedNotificationSlice.reducer;