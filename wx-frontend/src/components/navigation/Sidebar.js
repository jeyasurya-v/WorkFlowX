import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaTachometerAlt, 
  FaStream, 
  FaUsers, 
  FaCog, 
  FaChartBar,
  FaServer,
  FaTimes,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import OrganizationSwitcher from './OrganizationSwitcher';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { currentOrganization } = useSelector((state) => state.organizations);
  const [expandedMenus, setExpandedMenus] = useState({
    analytics: false
  });

  const toggleMenu = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    });
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navLinkClasses = (path) => {
    return `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
      isActive(path)
        ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`;
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <FaTachometerAlt className="mr-3 h-5 w-5" />
    },
    {
      name: 'Pipelines',
      path: '/pipelines',
      icon: <FaStream className="mr-3 h-5 w-5" />
    },
    {
      name: 'Organizations',
      path: '/organizations',
      icon: <FaUsers className="mr-3 h-5 w-5" />
    },
    {
      name: 'Analytics',
      icon: <FaChartBar className="mr-3 h-5 w-5" />,
      submenu: true,
      submenuItems: [
        {
          name: 'Pipeline Performance',
          path: '/analytics/performance'
        },
        {
          name: 'Build Statistics',
          path: '/analytics/builds'
        },
        {
          name: 'Deployment Metrics',
          path: '/analytics/deployments'
        }
      ]
    },
    {
      name: 'Infrastructure',
      path: '/infrastructure',
      icon: <FaServer className="mr-3 h-5 w-5" />
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <FaCog className="mr-3 h-5 w-5" />
    }
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
          <span className="text-xl font-bold text-gray-900 dark:text-white">PipelineRadar</span>
          <button
            type="button"
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors duration-200 lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Close sidebar</span>
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Organization switcher */}
        {currentOrganization && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <OrganizationSwitcher />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name} className="transition-all duration-200 hover-lift">
                {item.submenu ? (
                  <div>
                    <button
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200`}
                      onClick={() => toggleMenu(item.name.toLowerCase())}
                    >
                      <div className="flex items-center">
                        {item.icon}
                        {item.name}
                      </div>
                      {expandedMenus[item.name.toLowerCase()] ? (
                        <FaChevronDown className="h-4 w-4 transition-transform duration-200" />
                      ) : (
                        <FaChevronRight className="h-4 w-4 transition-transform duration-200" />
                      )}
                    </button>
                    {expandedMenus[item.name.toLowerCase()] && (
                      <ul className="mt-1 pl-10 space-y-1">
                        {item.submenuItems.map((subItem) => (
                          <li key={subItem.name} className="transition-all duration-200 hover-lift">
                            <NavLink
                              to={subItem.path}
                              className={navLinkClasses(subItem.path)}
                            >
                              {subItem.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={navLinkClasses(item.path)}
                  >
                    {item.icon}
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>PipelineRadar v0.1.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
