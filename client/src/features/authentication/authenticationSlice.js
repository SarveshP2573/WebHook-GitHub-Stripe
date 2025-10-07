import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

// Login
export const login = createAsyncThunk('auth/login', async (body, thunkApi) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_API}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      const err = await response.json()
      return thunkApi.rejectWithValue(err)
    }

    return await response.json()
  } catch (err) {
    console.log(err)
    return thunkApi.rejectWithValue(err.message)
  }
})

// Signup
export const signup = createAsyncThunk(
  'auth/signup',
  async (body, thunkApi) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_API}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify(body)
        }
      )

      if (!response.ok) {
        const err = await response.json()
        return thunkApi.rejectWithValue(err)
      }

      return await response.json()
    } catch (err) {
      return thunkApi.rejectWithValue(err.message)
    }
  }
)

// Verify token
export const verifyUser = createAsyncThunk(
  'auth/verify',
  async (_, thunkApi) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_API}/auth/me`,
        { credentials: 'include' }
      )

      if (!response.ok) throw new Error('Unauthorized')

      return await response.json()
    } catch (err) {
      return thunkApi.rejectWithValue(err.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    token: localStorage.getItem('token'),
    user: null,
    error: null
  },
  reducers: {
    logout: state => {
      localStorage.removeItem('token')
      state.user = null
      state.token = null
    }
  },
  extraReducers: builder => {
    // Login
    builder.addCase(login.pending, state => {
      state.loading = true
      state.error = null
    })
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.token)
    })
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })

    // Signup
    builder.addCase(signup.fulfilled, (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.token)
    })

    // Verify
    builder.addCase(verifyUser.fulfilled, (state, action) => {
      state.user = action.payload.user
    })
    builder.addCase(verifyUser.rejected, state => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
