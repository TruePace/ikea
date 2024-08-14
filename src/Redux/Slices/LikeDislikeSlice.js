import { createSlice } from '@reduxjs/toolkit';

const likeDislikeSlice = createSlice({
  name: 'likeDislike',
  initialState: {},
  reducers: {
    setLikeDislike: (state, action) => {
      const { contentId, likeCount, dislikeCount,activeButton  } = action.payload;
      state[contentId] = { likeCount, dislikeCount, activeButton  };
    },
  },
});

export const { setLikeDislike } = likeDislikeSlice.actions;
export default likeDislikeSlice.reducer;