import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Lock, User, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const { login, credentials, changeCredentials } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Quick Change Credentials Modal / State
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changeSuccess, setChangeSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setTimeout(() => {
      const res = login(username, password)
      setLoading(false)
      if (res.success) {
        navigate(from, { replace: true })
      } else {
        setError(res.error || 'Invalid credentials')
      }
    }, 250)
  }

  const handleUpdateCreds = (e) => {
    e.preventDefault()
    if (!newUsername.trim() || !newPassword.trim()) return
    changeCredentials(newUsername.trim(), newPassword.trim())
    setChangeSuccess('Credentials updated successfully! Use your new details to sign in.')
    setShowChangeModal(false)
    setUsername(newUsername.trim())
    setPassword('')
  }

  const fillDefaultCredentials = () => {
    setUsername(credentials.username)
    setPassword(credentials.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col justify-center items-center p-4 selection:bg-amber-100">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-amber-900/5 p-8 md:p-10">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/60 text-3xl shadow-sm mb-1">
              🏺
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Hastkala</h1>
            <p className="text-xs text-gray-500 font-medium">Rural Artisan & Supply Chain Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {changeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                {changeSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="input pl-10 text-sm w-full font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input pl-10 pr-10 text-sm w-full font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 mt-2 font-bold shadow-md shadow-amber-500/10 text-sm"
              loading={loading}
            >
              <ShieldCheck className="w-4 h-4" />
              Sign In to Hastkala
            </Button>
          </form>

          {/* Quick Helper Credentials Card */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-gray-500 bg-amber-50/70 border border-amber-200/60 rounded-xl p-3">
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-700 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Default Credentials:
                </p>
                <p className="text-[11px] text-gray-600">
                  User: <strong className="text-gray-800">{credentials.username}</strong> | Pass: <strong className="text-gray-800">{credentials.password}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={fillDefaultCredentials}
                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 underline bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setNewUsername(credentials.username)
                  setNewPassword(credentials.password)
                  setShowChangeModal(true)
                }}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                Change Password / Username
              </button>
            </div>
          </div>
        </div>

        {/* Change Credentials Modal */}
        {showChangeModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-fade-in">
              <h3 className="font-bold text-base text-gray-900">Change Login Credentials</h3>
              <p className="text-xs text-gray-500">Update your access username and password.</p>

              <form onSubmit={handleUpdateCreds} className="space-y-3">
                <div>
                  <label className="label">New Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowChangeModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save New Credentials
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
