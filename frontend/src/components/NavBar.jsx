import React, { useState, useEffect } from 'react';

const NavBar = ( { user, logout } ) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Debug logging for user prop
  useEffect(() => {
    console.log("🔸 NavBar component - Received user prop:", user);
  }, [user]);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="max-w-full mx-auto px-4 relative">
          <div className="flex justify-between items-center h-14">
            {/* Left Section: Triangle Logo + Project Name + Dropdown */}
            <div className="flex items-center space-x-4">
              {/* Triangle Logo */}
              <div className="flex items-center space-x-2">
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {user?.username || 'Guest'}'s gastos
                  </span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Projects
                </a>
                <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Settings
                </a>
              </div>
            </div>

            {/* Center Section: Search Bar - Absolutely positioned to true center */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-10">
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="🔍Find..."
                  className="w-full pl-4 pr-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Right Section: Icons + Profile */}
            <div className="flex items-center space-x-3">
              {/* Feedback Button */}
              <button className="hidden md:flex text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium px-2 py-1 transition-colors">
                Feedback
              </button>

              {/* Notification Bell */}
              <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <span className="text-base">O</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              {/* Apps Grid */}
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <div className="w-4 h-4 grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-current rounded-sm"></div>
                  ))}
                </div>
              </button>

              {/* Profile Avatar */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                    fill
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        { 
                         user?.username || 'Guest User'
                        }
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'fill@email.com'}
                      </p>
                    </div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      vitae
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      ipsum
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      lorem
                    </a>
                    <hr className="my-1 border-gray-200 dark:border-gray-600" />
                    <button 
                      onClick={logout} 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <span className="text-lg">{isMenuOpen ? '✕' : '☰'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 py-3 space-y-1">
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      🔍
                    </span>
                    <input
                      type="text"
                      placeholder="Find..."
                      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                  Dashboard
                </a>
                <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                  Projects
                </a>
                <a href="#" className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                  Settings
                </a>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <a href="#" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    Feedback
                  </a>
                  <a href="#" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    Profile
                  </a>
                  <a href="#" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
                    Sign Out
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme indicator for demo */}
        {/* <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 px-4 py-2 fade-out">
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
            Current theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'} (automatically detected from system)
          </p>
        </div> */}
      </nav>
    </div>
  );
};

export default NavBar;