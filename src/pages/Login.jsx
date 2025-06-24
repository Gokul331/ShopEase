
import AuthLogin from '../auth/Login'

const Login = ({ setIsAuthenticated }) => {
  return (
    <AuthLogin setIsAuthenticated={setIsAuthenticated} />
  )
}

export default Login