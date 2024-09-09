import { createSlice } from '@reduxjs/toolkit';

const likesSlice = createSlice({
  name: 'likes',
  initialState: {},
  reducers: {
    setLikes: (state, action) => {
      const { videoId, likes } = action.payload;
      state[videoId] = likes;
    },
  },
});

export const { setLikes } = likesSlice.actions;
export default likesSlice.reducer;