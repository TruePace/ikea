import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import likeDislikeReducer from './Slices/LikeDislikeSlice';
import viewedContentReducer from './Slices/ViewContentSlice';
import commentCountReducer from './Slices/CommentCountSlice';
import subscriptionReducer from './Slices/SubscriptionSlice';
import likesReducer from './Slices/LikesSlice'
import viewsReducer from './Slices/ViewsSlice'
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['viewedContent', 'likeDislike', 'commentCount', 'subscriptions', 'likes', 'views'],
};

const rootReducer = combineReducers({
  viewedContent: viewedContentReducer,
  likeDislike: likeDislikeReducer,
  commentCount: commentCountReducer,
  subscriptions: subscriptionReducer,
  likes: likesReducer,
  views: viewsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);