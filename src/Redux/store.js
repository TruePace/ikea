import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import likeDislikeReducer from './Slices/LikeDislikeSlice';
import viewedContentReducer from './Slices/ViewContentSlice';
import commentCountReducer from './Slices/CommentCountSlice';
import subscriptionReducer from './Slices/SubscriptionSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['viewedContent', 'likeDislike', 'commentCount', 'subscriptions'],
};

const rootReducer = combineReducers({
  viewedContent: viewedContentReducer,
  likeDislike: likeDislikeReducer,
  commentCount: commentCountReducer,
  subscriptions: subscriptionReducer,
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