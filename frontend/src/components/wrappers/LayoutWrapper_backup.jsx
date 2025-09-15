import React, { useState } from "react";
import NavBar from "../NavBar";
import Sidebar from "../Sidebar";

const LayoutWrapper = ({
  children,
  user,
  logout,
  pageType = null,
  onGroupByChange = null,
  currentGroupBy = null,
  showSidebar = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGroupByChange = (newGroupBy) => {
    if (onGroupByChange) {
      onGroupByChange(newGroupBy);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onGroupByChange={handleGroupByChange}
          currentGroupBy={currentGroupBy}
          pageType={pageType}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Bar */}
        <NavBar user={user} logout={logout} />

        {/* Page Content */}
        <div className="flex-1">
          {/* Mobile sidebar toggle button */}
          {showSidebar && (
            <div className="md:hidden p-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
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

          {/* Children content with proper spacing */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutWrapper;
