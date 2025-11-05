import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Filter,
} from "lucide-react";
import { componentStyles } from '../../utils/colorSystem';
import { 
  NAVIGATION_ITEMS, 
  GROUP_BY_OPTIONS, 
  isActiveNavigation 
} from '../../constants/navigation';

const Sidebar = ({
  isOpen,
  setIsOpen,
  onGroupByChange,
  currentGroupBy = null,
  pageType = null, // 'gastos', 'medios-pago', 'home'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current path matches navigation item (uses imported helper)
  const isActiveLink = (path) => isActiveNavigation(path, location.pathname);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Handle group by selection
  const handleGroupBySelect = (groupId) => {
    if (onGroupByChange) {
      onGroupByChange(groupId);
    }
  };

  // Get current page group options
  const getCurrentGroupOptions = () => {
    if (!pageType || !GROUP_BY_OPTIONS[pageType]) return [];
    return GROUP_BY_OPTIONS[pageType];
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className={componentStyles.modal.overlay.replace('z-50', 'z-40')}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 
        transform transition-all duration-300 ease-in-out z-50 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isOpen ? 'w-80' : 'w-16'}
        md:relative md:translate-x-0
      `}>
        {/* Header */}
         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 h-14">
          {isOpen && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Navegación
            </h2>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Section */}
          <div className="p-4">
            {isOpen && (
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
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors justify-center
                        ${
                          isActive
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                      title={!isOpen ? item.label : ""}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {isOpen && (
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
                    {isOpen && item.children && isActive && (
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
                              <ChildIcon size={16} className="flex-shrink-0" />
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
          {isOpen && getCurrentGroupOptions().length > 0 && (
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
          {isOpen && (
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
  );
};

export default Sidebar;
