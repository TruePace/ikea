import { createSlice } from '@reduxjs/toolkit';

const viewsSlice = createSlice({
  name: 'views',
  initialState: {},
  reducers: {
    setViews: (state, action) => {
      const { videoId, views } = action.payload;
      state[videoId] = views;
    },
  },
});

export const { setViews } = viewsSlice.actions;
export default viewsSlice.reducer;