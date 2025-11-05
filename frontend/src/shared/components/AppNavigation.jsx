/**
 * AppNavigation - Unified Navigation Component
 * 
 * Combines the functionality of NavBar and Sidebar into a single,
 * cohesive navigation system with better alignment and simpler usage.
 * 
 * Features:
 * - Top bar with search, notifications, apps menu, and profile
 * - Collapsible sidebar with page navigation and contextual filters
 * - Mobile-responsive with overlay
 * - Desktop icon-only mode when collapsed
 * - Single source of truth for navigation state
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PanelLeftOpen,
  PanelLeftClose,
  BarChart3,
  Filter,
  Bell,
  Search,
} from "lucide-react";
import { componentStyles } from "../../utils/colorSystem";
import {
  NAVIGATION_ITEMS,
  GROUP_BY_OPTIONS,
  isActiveNavigation,
} from "../../constants/navigation";

const AppNavigation = ({
  user,
  onLogout,
  pageContext = null, // 'gastos', 'medios-pago', 'grupos', 'home'
  currentGroupBy = null,
  onGroupByChange = null,
  showSidebar = true, // Some pages (forms, details) don't need sidebar
}) => {
  // Navigation state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * SEARCH FUNCTIONALITY:
   * Browser-native "Find in Page" feature implemented in React.
   * Uses DOM manipulation to highlight text matches across the entire page.
   * 
   * Why DOM manipulation:
   * - React state can't track arbitrary text nodes across all components
   * - Native browser search (Ctrl+F) doesn't have programmatic access
   * - Allows custom styling and navigation of search results
   */

  // Clear previous highlights
  const clearHighlights = useCallback(() => {
    const highlights = document.querySelectorAll(".search-highlight");
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      parent.replaceChild(
        document.createTextNode(highlight.textContent),
        highlight
      );
      parent.normalize();
    });
  }, []);

  // Highlight text function
  const highlightText = useCallback(
    (searchText) => {
      if (!searchText.trim()) {
        clearHighlights();
        setTotalMatches(0);
        setCurrentMatchIndex(0);
        return [];
      }

      clearHighlights();

      const walker = document.createTreeWalker(
        document.querySelector("main") || document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            // Skip script and style elements
            if (
              node.parentNode.tagName === "SCRIPT" ||
              node.parentNode.tagName === "STYLE" ||
              node.parentNode.tagName === "NOSCRIPT"
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }

      const matchElements = [];
      const regex = new RegExp(
        searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      );

      textNodes.forEach((textNode) => {
        const text = textNode.textContent;
        const matches = [...text.matchAll(regex)];

        if (matches.length > 0) {
          const parent = textNode.parentNode;
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;

          matches.forEach((match) => {
            // Add text before match
            if (match.index > lastIndex) {
              fragment.appendChild(
                document.createTextNode(text.slice(lastIndex, match.index))
              );
            }

            // Create highlight element
            const highlight = document.createElement("span");
            highlight.className =
              "search-highlight bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white font-semibold rounded px-1";
            highlight.textContent = match[0];
            highlight.setAttribute("data-search-index", matchElements.length);
            fragment.appendChild(highlight);
            matchElements.push(highlight);

            lastIndex = match.index + match[0].length;
          });

          // Add remaining text
          if (lastIndex < text.length) {
            fragment.appendChild(
              document.createTextNode(text.slice(lastIndex))
            );
          }

          parent.replaceChild(fragment, textNode);
        }
      });

      setTotalMatches(matchElements.length);
      return matchElements;
    },
    [clearHighlights]
  );

  // Search and navigate function
  const performSearch = useCallback(
    (searchText, direction = "next") => {
      const matches = highlightText(searchText);

      if (matches.length === 0) {
        setCurrentMatchIndex(0);
        return;
      }

      let newIndex;
      if (direction === "next") {
        newIndex =
          currentMatchIndex < matches.length - 1 ? currentMatchIndex + 1 : 0;
      } else {
        newIndex =
          currentMatchIndex > 0 ? currentMatchIndex - 1 : matches.length - 1;
      }

      setCurrentMatchIndex(newIndex);

      // Remove current highlight from all matches
      matches.forEach((match) => {
        match.classList.remove("ring-2", "ring-blue-500", "ring-offset-1");
      });

      // Highlight current match
      const currentMatch = matches[newIndex];
      if (currentMatch) {
        currentMatch.classList.add("ring-2", "ring-blue-500", "ring-offset-1");

        // Scroll to current match
        currentMatch.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    },
    [highlightText, currentMatchIndex]
  );

  // Handle search input
  const handleSearchChange = useCallback(
    (value) => {
      setSearchTerm(value);
      setCurrentMatchIndex(0);

      if (value.trim()) {
        performSearch(value, "next");
      } else {
        clearHighlights();
        setTotalMatches(0);
      }
    },
    [performSearch, clearHighlights]
  );

  // Handle search navigation
  const handleSearchNavigation = useCallback(
    (direction) => {
      if (searchTerm.trim() && totalMatches > 0) {
        performSearch(searchTerm, direction);
      }
    },
    [searchTerm, totalMatches, performSearch]
  );

  // Handle Enter key for search navigation
  const handleSearchKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          handleSearchNavigation("prev");
        } else {
          handleSearchNavigation("next");
        }
      } else if (e.key === "Escape") {
        setSearchTerm("");
        clearHighlights();
        setTotalMatches(0);
        setCurrentMatchIndex(0);
      }
    },
    [handleSearchNavigation, clearHighlights]
  );

  // Clean up highlights when component unmounts
  useEffect(() => {
    return () => {
      clearHighlights();
    };
  }, [clearHighlights]);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(mediaQuery.matches);

    const handler = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Handle group by selection
  const handleGroupBySelect = (groupId) => {
    if (onGroupByChange) {
      onGroupByChange(groupId);
    }
  };

  // Get current page group options
  const getCurrentGroupOptions = () => {
    if (!pageContext || !GROUP_BY_OPTIONS[pageContext]) return [];
    return GROUP_BY_OPTIONS[pageContext];
  };

  // Check if link is active
  const isActiveLink = (path) => isActiveNavigation(path, location.pathname);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors fixed top-0 left-0 right-0 z-40">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            {/* Left Section: Sidebar Toggle + Logo */}
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button */}
              {showSidebar && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  title={sidebarOpen ? "Cerrar navegación" : "Abrir navegación"}
                >
                  {sidebarOpen ? (
                    <PanelLeftClose size={20} />
                  ) : (
                    <PanelLeftOpen size={20} />
                  )}
                </button>
              )}

              {/* Logo/Home Link */}
              <button
                onClick={() => handleNavigation("/")}
                className="font-semibold text-gray-900 dark:text-white text-sm bg-gray-50 dark:bg-gray-800 rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Inicio
              </button>
            </div>

            {/* Center Section: Search Bar */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 z-10">
              <div className="relative w-96">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-10 pr-16 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                {totalMatches > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {currentMatchIndex + 1}/{totalMatches}
                    </span>
                    <button
                      onClick={() => handleSearchNavigation("prev")}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      title="Previous (Shift+Enter)"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleSearchNavigation("next")}
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
              <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                <Bell size={18} />
              </button>

              {/* Apps Grid Menu */}
              <div className="relative">
                <button
                  onClick={() =>
                    setIsMenuOpen(isMenuOpen === "apps" ? false : "apps")
                  }
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                  title="Aplicaciones"
                >
                  <div className="w-4 h-4 grid grid-cols-3 gap-0.5">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 h-1 bg-current rounded-sm"
                      ></div>
                    ))}
                  </div>
                </button>
                {isMenuOpen === "apps" && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2 z-50">
                    {NAVIGATION_ITEMS.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index === 0
                            ? "border-b border-gray-100 dark:border-gray-700"
                            : ""
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

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
                        {user?.username || "Guest User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || "fill@email.com"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 underline dark:text-gray-300 hover:bg-red-500 hover:text-white dark:hover:bg-gray-700 transition-colors"
                    >
                      Cerrar Sesión
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
                  <span className="text-lg">{isMenuOpen ? "✕" : "☰"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu with search */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
              <div className="px-2 py-3 space-y-1">
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                      <Search size={16} />
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
                          onClick={() => handleSearchNavigation("prev")}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Previous"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleSearchNavigation("next")}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                          title="Next"
                        >
                          ↓
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {/* Backdrop for mobile */}
          {sidebarOpen && (
            <div
              className={componentStyles.modal.overlay.replace("z-50", "z-30")}
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel */}
          <div
            className={`
            fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
            transform transition-all duration-300 ease-in-out z-40 flex flex-col
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            ${sidebarOpen ? "w-80" : "md:w-16"}
          `}
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Navigation Section */}
              <div className="p-4">
                {sidebarOpen && (
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Páginas
                  </h3>
                )}

                <nav className="space-y-2">
                  {NAVIGATION_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveLink(item.path);

                    return (
                      <div key={item.id}>
                        {/* Main navigation item */}
                        <button
                          onClick={() => handleNavigation(item.path)}
                          className={`
                            w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                            ${!sidebarOpen && "justify-center"}
                            ${
                              isActive
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }
                          `}
                          title={!sidebarOpen ? item.label : ""}
                        >
                          <Icon size={20} className="flex-shrink-0" />
                          {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                              </div>
                            </div>
                          )}
                        </button>

                        {/* Children (sub-navigation) */}
                        {sidebarOpen && item.children && isActive && (
                          <div className="ml-6 mt-2 space-y-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive =
                                location.pathname === child.path;

                              return (
                                <button
                                  key={child.id}
                                  onClick={() => handleNavigation(child.path)}
                                  className={`
                                    w-full flex items-center space-x-2 px-3 py-1.5 rounded text-sm text-left transition-colors
                                    ${
                                      isChildActive
                                        ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }
                                  `}
                                >
                                  <ChildIcon
                                    size={16}
                                    className="flex-shrink-0"
                                  />
                                  <span className="truncate">{child.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Group By Section */}
              {sidebarOpen && getCurrentGroupOptions().length > 0 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                    <Filter size={16} className="mr-2" />
                    Agrupar Por
                  </h3>

                  <div className="space-y-2">
                    {getCurrentGroupOptions().map((option) => {
                      const Icon = option.icon;
                      const isSelected = currentGroupBy === option.id;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleGroupBySelect(option.id)}
                          className={`
                            w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                            ${
                              isSelected
                                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }
                          `}
                        >
                          <Icon size={18} className="flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {option.description}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Clear grouping button */}
                  {currentGroupBy && (
                    <button
                      onClick={() => handleGroupBySelect(null)}
                      className="w-full mt-3 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Limpiar agrupación
                    </button>
                  )}
                </div>
              )}

              {/* Analytics Section (for future expansion) */}
              {sidebarOpen && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                    <BarChart3 size={16} className="mr-2" />
                    Análisis
                  </h3>

                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Próximamente: reportes y análisis avanzados
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppNavigation;
