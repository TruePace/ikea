import { createSlice } from '@reduxjs/toolkit';

const channelSlice = createSlice({
  name: 'channels',
  initialState: {},
  reducers: {
    setChannelData: (state, action) => {
      const { channelId, data } = action.payload;
      state[channelId] = { ...state[channelId], ...data };
    },
  },
});

export const { setChannelData } = channelSlice.actions;
export default channelSlice.reducer;