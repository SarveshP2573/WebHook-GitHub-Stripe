import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authentication/authenticationSlice'

const store = configureStore({
  reducer: {
    auth:authReducer
  }
})

export default store
