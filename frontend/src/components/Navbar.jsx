import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-indigo-500/10 bg-[#06060f]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-mono font-bold text-xl gradient-text">
          ResumeAI
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Home
          </Link>
          <Link
            to="/quick-scan"
            className={`text-sm font-medium transition-colors ${location.pathname === '/quick-scan' ? 'text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Quick Scan
          </Link>
          <Link
            to="/analyze"
            className="px-4 py-2 rounded-lg gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Analyze Resume
          </Link>
        </div>
      </div>
    </nav>
  )
}
