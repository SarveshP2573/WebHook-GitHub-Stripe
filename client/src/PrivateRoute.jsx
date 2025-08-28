import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const PrivateRoute = ({ children }) => {
  const { user, token } = useSelector(state => state.auth)

  if (!token || !user) {
    return <Navigate to='/auth' replace />
  }

  return children
}

export default PrivateRoute
