import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
}

export function AuthProvider({ children }) {
  // Saved credentials
  const [credentials, setCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('hastkala_auth_creds')
      return saved ? JSON.parse(saved) : DEFAULT_CREDENTIALS
    } catch {
      return DEFAULT_CREDENTIALS
    }
  })

  // Session state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hastkala_auth_session')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (usernameInput, passwordInput) => {
    const inputU = (usernameInput || '').trim().toLowerCase()
    const storedU = (credentials.username || '').trim().toLowerCase()

    if (inputU === storedU && passwordInput === credentials.password) {
      const sessionUser = { username: credentials.username, role: 'Administrator' }
      setUser(sessionUser)
      try {
        localStorage.setItem('hastkala_auth_session', JSON.stringify(sessionUser))
      } catch (e) {
        console.error('Session write error', e)
      }
      return { success: true }
    }
    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem('hastkala_auth_session')
    } catch (e) {
      console.error('Session remove error', e)
    }
  }

  const changeCredentials = (newUsername, newPassword) => {
    const updated = {
      username: (newUsername || 'admin').trim(),
      password: newPassword || 'password123'
    }
    setCredentials(updated)
    try {
      localStorage.setItem('hastkala_auth_creds', JSON.stringify(updated))
    } catch (e) {
      console.error('Creds write error', e)
    }
    return true
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      credentials,
      changeCredentials
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
