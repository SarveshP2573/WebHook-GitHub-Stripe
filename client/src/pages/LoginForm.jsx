// src/components/Auth/LoginForm.js
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { login } from '../features/authentication/authenticationSlice'
import '../styles/authform.css'

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { loading, error, user } = useSelector(state => state.auth)

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'
    return newErrors
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    dispatch(login(formData)).then(res => {
      if (res.type === 'auth/login/fulfilled') {
        navigate('/dashboard') // ✅ redirect after login
      }
    })
  }

  return (
    <form className='auth-form' onSubmit={handleSubmit}>
      <div className='form-group'>
        <label htmlFor='email'>Email Address</label>
        <input
          type='email'
          id='email'
          name='email'
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          placeholder='Enter your email'
        />
        {errors.email && <span className='error-message'>{errors.email}</span>}
      </div>

      <div className='form-group'>
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          id='password'
          name='password'
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
          placeholder='Enter your password'
        />
        {errors.password && (
          <span className='error-message'>{errors.password}</span>
        )}
      </div>

      {error && <p className='error-message'>{error}</p>}

      <button
        type='submit'
        className='btn-primary auth-submit'
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}

export default LoginForm
