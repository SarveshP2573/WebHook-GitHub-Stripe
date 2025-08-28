import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { logout } from '../features/authentication/authenticationSlice'
import '../styles/navbar.css'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const token = useSelector(state => state.auth.token)
  const dispatch = useDispatch()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logout()) // clears redux + localStorage + backend logout
  }

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className='navbar-container'>
        <div className='navbar-brand'>
          <i className='fas fa-bolt'></i>
          <Link
            className='navbar-brand'
            style={{ textDecoration: 'none' }}
            to={'/'}
          >
            <span>WebhookHub</span>
          </Link>
        </div>

        <div className='navbar-links'>
          {token ? (
            <>
              <Link to='/dashboard'>Dashboard</Link>
              <Link to='/webhooks'>Webhooks</Link>
              <a href='#profile'>Profile</a>
              <button onClick={handleLogout} className='btn-primary'>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to='/login'>Login</Link>
              <Link to='/signup'>Signup</Link>
            </>
          )}
        </div>

        <div className='navbar-toggle'>
          <i className='fas fa-bars'></i>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
