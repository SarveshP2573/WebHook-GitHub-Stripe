// src/components/Auth/SignupForm.js
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { signup } from '../features/authentication/authenticationSlice'
import '../styles/authform.css'

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '', // ✅ changed from username → name
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Name is required'
    else if (formData.name.length < 3)
      newErrors.name = 'Name must be at least 3 characters'

    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Email is invalid'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters'

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'

    return newErrors
  }

  const handleSubmit = e => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    dispatch(signup(formData)).then(res => {
      if (res.type === 'auth/signup/fulfilled') {
        navigate('/dashboard')
      }
    })
  }

  return (
    <form className='auth-form' onSubmit={handleSubmit}>
      {/* --- Name --- */}
      <div className='form-group'>
        <label htmlFor='name'>Full Name</label>
        <input
          type='text'
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
          placeholder='Enter your name'
        />
        {errors.name && <span className='error-message'>{errors.name}</span>}
      </div>

      {/* --- Email --- */}
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

      {/* --- Password --- */}
      <div className='form-group'>
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          id='password'
          name='password'
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
          placeholder='Create a password'
        />
        {errors.password && (
          <span className='error-message'>{errors.password}</span>
        )}
        <div className='password-hint'>Must be at least 6 characters</div>
      </div>

      {/* --- Confirm Password --- */}
      <div className='form-group'>
        <label htmlFor='confirmPassword'>Confirm Password</label>
        <input
          type='password'
          id='confirmPassword'
          name='confirmPassword'
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'error' : ''}
          placeholder='Confirm your password'
        />
        {errors.confirmPassword && (
          <span className='error-message'>{errors.confirmPassword}</span>
        )}
      </div>

      {/* --- Terms --- */}
      <div className='form-group checkbox-group'>
        <label className='checkbox-container'>
          <input
            type='checkbox'
            name='agreeToTerms'
            checked={formData.agreeToTerms}
            onChange={handleChange}
          />
          <span className='checkmark'></span>I agree to the{' '}
          <a href='#terms'>Terms of Service</a> and{' '}
          <a href='#privacy'>Privacy Policy</a>
        </label>
        {errors.agreeToTerms && (
          <span className='error-message'>{errors.agreeToTerms}</span>
        )}
      </div>

      {error && <p className='error-message'>{error}</p>}

      <button
        type='submit'
        className='btn-primary auth-submit'
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  )
}

export default SignupForm
