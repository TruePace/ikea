import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    hasMissedContent: false,
    missedContentCount: 0,
  },
  reducers: {
    setHasMissedContent: (state, action) => {
      state.hasMissedContent = action.payload;
    },
    setMissedContentCount: (state, action) => {
      state.missedContentCount = action.payload;
    },
    incrementMissedContentCount: (state) => {
      state.missedContentCount += 1;
      state.hasMissedContent = true;
    },
    resetMissedContentCount: (state) => {
      state.missedContentCount = 0;
      state.hasMissedContent = false;
    },
  },
});

export const { 
  setHasMissedContent, 
  setMissedContentCount, 
  incrementMissedContentCount, 
  resetMissedContentCount 
} = notificationSlice.actions;

export default notificationSlice.reducer;