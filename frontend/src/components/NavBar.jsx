import React, { useState, useEffect, useCallback } from 'react';



const NavBar = ( { user } ) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  

  // Clear previous highlights
  const clearHighlights = useCallback(() => {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }, []);

  // Highlight text function
  const highlightText = useCallback((searchText) => {
    if (!searchText.trim()) {
      clearHighlights();
      setTotalMatches(0);
      setCurrentMatchIndex(0);
      return [];
    }

    clearHighlights();
    
    const walker = document.createTreeWalker(
      document.querySelector('main') || document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip script and style elements
          if (node.parentNode.tagName === 'SCRIPT' || 
              node.parentNode.tagName === 'STYLE' ||
              node.parentNode.tagName === 'NOSCRIPT') {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    const matchElements = [];
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const matches = [...text.matchAll(regex)];
      
      if (matches.length > 0) {
        const parent = textNode.parentNode;
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;

        matches.forEach((match) => {
          // Add text before match
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
          }

          // Create highlight element
          const highlight = document.createElement('span');
          highlight.className = 'search-highlight bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-semibold rounded px-1';
          highlight.textContent = match[0];
          highlight.setAttribute('data-search-index', matchElements.length);
          fragment.appendChild(highlight);
          matchElements.push(highlight);

          lastIndex = match.index + match[0].length;
        });

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        parent.replaceChild(fragment, textNode);
      }
    });

    setTotalMatches(matchElements.length);
    return matchElements;
  }, [clearHighlights]);

  // Search and navigate function
  const performSearch = useCallback((searchText, direction = 'next') => {
    const matches = highlightText(searchText);
    
    if (matches.length === 0) {
      setCurrentMatchIndex(0);
      return;
    }

    let newIndex;
    if (direction === 'next') {
      newIndex = currentMatchIndex < matches.length - 1 ? currentMatchIndex + 1 : 0;
    } else {
      newIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : matches.length - 1;
    }

    setCurrentMatchIndex(newIndex);

    // Remove current highlight from all matches
    matches.forEach(match => {
      match.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-1');
    });

    // Highlight current match
    const currentMatch = matches[newIndex];
    if (currentMatch) {
      currentMatch.classList.add('ring-2', 'ring-blue-500', 'ring-offset-1');
      
      // Scroll to current match
      currentMatch.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [highlightText, currentMatchIndex]);

  // Handle search input
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentMatchIndex(0);
    
    if (value.trim()) {
      performSearch(value, 'next');
    } else {
      clearHighlights();
      setTotalMatches(0);
    }
  }, [performSearch, clearHighlights]);

  // Handle search navigation
  const handleSearchNavigation = useCallback((direction) => {
    if (searchTerm.trim() && totalMatches > 0) {
      performSearch(searchTerm, direction);
    }
  }, [searchTerm, totalMatches, performSearch]);

  // Handle Enter key for search navigation
  const handleSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handleSearchNavigation('prev');
      } else {
        handleSearchNavigation('next');
      }
    } else if (e.key === 'Escape') {
      setSearchTerm('');
      clearHighlights();
      setTotalMatches(0);
      setCurrentMatchIndex(0);
    }
  }, [handleSearchNavigation, clearHighlights]);

  // Clean up highlights when component unmounts
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, [clearHighlights]);

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
      <nav className="bg-white  dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="max-w-full mx-auto px-4 relative">
          <div className="flex justify-between items-center h-14">
            {/* Left Section: Triangle Logo + Project Name + Dropdown */}
            <div className="flex items-center space-x-4">
              {/* Triangle Logo */}
              <div className="flex items-center space-x-2">
                </div>
                <div className="flex items-center space-x-1" onClick={() => window.location.href = '/'}>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1">
                    Inicio
                  </span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <a href="/medios-pago" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Medios de Pago
                </a>
                <a href="/gastos" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors">
                  Gastos
                </a>
              </div>
            </div>

            {/* Center Section: Search Bar - Absolutely positioned to true center */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-10">
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="🔍Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-4 pr-16 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {totalMatches > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentMatchIndex + 1}/{totalMatches}
                    </span>
                    <button
                      onClick={() => handleSearchNavigation('prev')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Previous (Shift+Enter)"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleSearchNavigation('next')}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Next (Enter)"
                    >
                      ↓
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section: Icons + Profile */}
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <button className="notifications relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <span className="text-base">🔔</span>
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span> */}
              </button>

              {/* Apps Grid */}
              <button className="dashboard p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
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
                    {user?.username ? user.username.slice(0, 3) : ""}
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
                      onClick={() => window.location.href = '/logout'}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 underline dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:bg-gray-700 transition-colors"
                    >
                      Cerrar Sesion
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
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full pl-10 pr-16 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    {totalMatches > 0 && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {currentMatchIndex + 1}/{totalMatches}
                        </span>
                        <button
                          onClick={() => handleSearchNavigation('prev')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Previous"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleSearchNavigation('next')}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Next"
                        >
                          ↓
                        </button>
                      </div>
                    )}
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
      </nav>
    </div>
  );
};

export default NavBar;