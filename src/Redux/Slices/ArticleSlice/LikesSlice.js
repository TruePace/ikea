import { createSlice } from "@reduxjs/toolkit";
// import SecondSocketHandler from "@/components/Socket io/SecondSocketHandler";
import socket from '@/components/Socket io/SocketClient';


const likesSlice = createSlice({
    name: 'likes',
    initialState: {},
    reducers: {
      setLikes: (state, action) => {
        const { contentId, likes } = action.payload;
        state[contentId] = likes;
        // console.log('Likes state updated:', state);
      },
    },
  });
  
  export const { setLikes } = likesSlice.actions;
  
  export const initializeLikesListener = () => (dispatch) => {
    socket.on('contentUpdated', (data) => {
      dispatch(setLikes({ contentId: data.contentId, likes: data.likesCount }));
    });
  };
  
  export default likesSlice.reducer;