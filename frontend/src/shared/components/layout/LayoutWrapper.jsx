import React from "react";
import AppNavigation from "./AppNavigation";

/**
 * Simplified Layout Wrapper using unified AppNavigation component
 * 
 * Provides consistent page layout with integrated navigation system.
 * All navigation state is managed internally by AppNavigation.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {Object} props.user - Current user object
 * @param {Function} props.onLogout - Logout handler
 * @param {string} props.pageType - Page context for sidebar ('gastos', 'medios-pago', 'grupos', 'home')
 * @param {boolean} props.showSidebar - Whether to show sidebar (default: true)
 * @param {Function} props.onGroupByChange - Handler for group by changes (optional)
 * @param {string} props.currentGroupBy - Current group by value (optional)
 * @param {string} props.pageTitle - Page title for SEO/accessibility (optional)
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
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Unified Navigation (Top Bar + Sidebar) */}
      <AppNavigation
        user={user}
        onLogout={onLogout}
        pageContext={pageType}
        showSidebar={showSidebar}
        currentGroupBy={currentGroupBy}
        onGroupByChange={onGroupByChange}
      />

      {/* Main Content Area */}
      <main 
        className={`
          transition-all duration-300
          ${showSidebar ? 'md:ml-16' : 'ml-0'}
          pt-14
        `}
      >
        {/* Page Content with proper spacing */}
        <div className="p-6">
          {/* Page Title for accessibility */}
          {pageTitle && <h1 className="sr-only">{pageTitle}</h1>}

          {/* Actual page content */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default LayoutWrapper;