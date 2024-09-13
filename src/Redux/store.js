import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import likeDislikeReducer from './Slices/LikeDislikeSlice';
import viewedContentReducer from './Slices/ViewContentSlice';
import commentCountReducer from './Slices/CommentCountSlice';
import subscriptionReducer from './Slices/SubscriptionSlice';
import likesReducer from './Slices/VideoSlice/LikesSlice';
import viewsReducer from './Slices/VideoSlice/ViewsSlice';
// below are the import for the ArticleSlice
import likesReducerArticle from './Slices/ArticleSlice/LikesSlice';
import viewsReducerArticle from './Slices/ArticleSlice/ViewsSlice';
import commentCountReducerArticle from './Slices/ArticleSlice/CommentCountSlice';
import channelReducer from './Slices/ArticleSlice/ChannelSlice'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['viewedContent', 'likeDislike', 'commentCount', 'subscriptions', 'likes', 'views', 'likesArticle', 'viewsArticle', 'commentCountArticle','channels'],
};

const rootReducer = combineReducers({
  viewedContent: viewedContentReducer,
  likeDislike: likeDislikeReducer,
  commentCount: commentCountReducer,
  subscriptions: subscriptionReducer,
  likes: likesReducer,
  views: viewsReducer,
  likesArticle: likesReducerArticle,
  viewsArticle: viewsReducerArticle,
  commentCountArticle: commentCountReducerArticle,
  channels: channelReducer,
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