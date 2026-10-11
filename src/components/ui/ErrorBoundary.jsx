import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-lg w-full shadow-xl text-center space-y-4">
            <div className="text-5xl">🏺</div>
            <h2 className="text-xl font-bold text-gray-900">Application Error Caught</h2>
            <div className="bg-red-50 text-red-800 p-3 rounded-xl text-xs text-left overflow-auto max-h-36 font-mono">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  try {
                    localStorage.clear()
                  } catch (e) {}
                  window.location.href = '/'
                }}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                Reset Data & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
