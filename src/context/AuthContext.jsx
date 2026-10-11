import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const ACCOUNTS = [
  {
    username: 'Hastkala',
    password: 'Welcome@@123##',
    role: 'Administrator'
  },
  {
    username: 'admin',
    password: 'password123',
    role: 'Administrator'
  }
]

export function AuthProvider({ children }) {
  // Custom changed credentials in localStorage (if any)
  const [customCreds, setCustomCreds] = useState(() => {
    try {
      const saved = localStorage.getItem('hastkala_auth_creds')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
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
    const inputP = passwordInput || ''

    // Check custom credentials if set
    if (customCreds) {
      if (inputU === (customCreds.username || '').trim().toLowerCase() && inputP === customCreds.password) {
        const sessionUser = { username: customCreds.username, role: 'Administrator' }
        setUser(sessionUser)
        try {
          localStorage.setItem('hastkala_auth_session', JSON.stringify(sessionUser))
        } catch (e) {
          console.error('Session write error', e)
        }
        return { success: true }
      }
    }

    // Check built-in accounts
    const match = ACCOUNTS.find(acc => acc.username.toLowerCase() === inputU && acc.password === inputP)
    if (match) {
      const sessionUser = { username: match.username, role: match.role }
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
      username: (newUsername || 'Hastkala').trim(),
      password: newPassword || ''
    }
    setCustomCreds(updated)
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
