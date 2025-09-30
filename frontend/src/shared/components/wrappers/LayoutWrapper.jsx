import React, { useState } from "react";
import NavBar from "../NavBar";
import Sidebar from "../Sidebar";

/**
 * Comprehensive Layout Wrapper that handles all page layouts
 * Includes NavBar, Sidebar, and main content area with proper spacing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.user - Current user object
 * @param {Function} props.onLogout - Logout handler
 * @param {string} props.pageType - Page type for sidebar context ('gastos', 'medios-pago', 'home')
 * @param {boolean} props.showSidebar - Whether to show sidebar (default: true)
 * @param {Function} props.onGroupByChange - Handler for group by changes (optional)
 * @param {string} props.currentGroupBy - Current group by value (optional)
 * @param {string} props.pageTitle - Page title for SEO/accessibility (optional)
 * @param {Object} props.sidebarConfig - Custom sidebar configuration (optional)
 */
const LayoutWrapper = ({
  children,
  user,
  onLogout,
  pageType = null,
  showSidebar = true,
  onGroupByChange = null,
  currentGroupBy = null,
  pageTitle = null,
  sidebarConfig = null,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGroupByChange = (newGroupBy) => {
    if (onGroupByChange) {
      onGroupByChange(newGroupBy);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onGroupByChange={handleGroupByChange}
          currentGroupBy={currentGroupBy}
          pageType={pageType}
          config={sidebarConfig}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Bar */}
        <NavBar user={user} logout={handleLogout} />

        {/* Page Content */}
        <main className="flex-1">
          {/* Mobile sidebar toggle button */}
          {showSidebar && (
            <div className="md:hidden p-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Page Content with proper spacing */}
          <div className="p-6">
            {/* Page Title for accessibility */}
            {pageTitle && (
              <h1 className="sr-only">{pageTitle}</h1>
            )}
            
            {/* Actual page content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;