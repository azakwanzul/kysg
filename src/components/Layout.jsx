import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Trophy, User, Settings, LogOut, Menu, X } from 'lucide-react'

const Layout = ({ children }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { path: '/', label: 'Game', icon: null },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ]

  // Add admin link if user is admin
  if (user?.email === 'admin@kysg.com') {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings })
  }

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-wordle-dark border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-white">
              KYSG
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-wordle-green text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-wordle-green text-white' 
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {Icon && <Icon size={20} />}
                      <span className="text-base">{item.label}</span>
                    </Link>
                  )
                })}
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors text-left"
                >
                  <LogOut size={20} />
                  <span className="text-base">Logout</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-wordle-dark border-t border-gray-700 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-400">
          <p className="text-sm sm:text-base">&copy; 2024 KYSG - Kata Yang Sama Game. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout 