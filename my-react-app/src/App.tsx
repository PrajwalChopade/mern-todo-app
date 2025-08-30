import { useState, useEffect } from 'react'
import Home from './components/Home'
import Login from './components/login'
import { authService, type User, type SignInPayload, type SignUpPayload } from './services/authService'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const initializeAuth = async () => {
      const currentUser = authService.getUser();
      const isAuth = authService.isAuthenticated();
      
      if (currentUser && isAuth) {
        // First set the user immediately from stored data
        setUser(currentUser);
        
        // Then validate token with server in background
        try {
          const isValidToken = await authService.validateToken();
          if (!isValidToken) {
            // Only logout if server explicitly says token is invalid
            setUser(null);
          }
        } catch (error) {
          // If server is unreachable, keep user logged in with stored data
          console.warn('Unable to validate token with server, keeping user logged in');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [])

  const handleSignIn = async (payload: SignInPayload) => {
    try {
      const user = await authService.signIn(payload)
      setUser(user)
    } catch (error) {
      throw error // Let the Login component handle the error
    }
  }

  const handleSignUp = async (payload: SignUpPayload) => {
    try {
      const user = await authService.signUp(payload)
      setUser(user)
    } catch (error) {
      throw error // Let the Login component handle the error
    }
  }

  const handleLogout = () => {
    authService.logout()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || !authService.isAuthenticated()) {
    return <Login onSignIn={handleSignIn} onSignUp={handleSignUp} />
  }

  return <Home user={user} onLogout={handleLogout} />
}

export default App