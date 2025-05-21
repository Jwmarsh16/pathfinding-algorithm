// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import pathfinderReducer from './pathfinderSlice'

export const store = configureStore({
  reducer: {
    pathfinder: pathfinderReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // ⚠️ Disable these two checks for faster development performance
      immutableCheck: false,
      serializableCheck: false
    }),
  devTools: process.env.NODE_ENV !== 'production'
})
