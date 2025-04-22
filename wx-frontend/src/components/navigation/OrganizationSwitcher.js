import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBuilding, FaChevronDown, FaPlus } from 'react-icons/fa';
import { setCurrentOrganization } from '../../store/slices/organizationSlice';
import { Link } from 'react-router-dom';

const OrganizationSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  
  const { organizations, currentOrganization } = useSelector(
    (state) => state.organizations
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOrganizationChange = (org) => {
    dispatch(setCurrentOrganization(org));
    setIsOpen(false);
  };

  // If no organizations are loaded yet, show a placeholder
  if (!organizations || organizations.length === 0 || !currentOrganization) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-1">
            <FaBuilding className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center justify-between w-full rounded-md py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <div className="bg-primary-100 dark:bg-primary-900 rounded-md p-1">
            <FaBuilding className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="truncate max-w-[160px]">{currentOrganization.name}</div>
        </div>
        <FaChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {organizations.map((org) => (
              <button
                key={org.id}
                className={`w-full text-left block px-4 py-2 text-sm ${
                  org.id === currentOrganization.id
                    ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                role="menuitem"
                onClick={() => handleOrganizationChange(org)}
              >
                <div className="flex items-center">
                  <span className="truncate">{org.name}</span>
                </div>
              </button>
            ))}
            
            <Link
              to="/organizations/new"
              className="w-full text-left block px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FaPlus className="mr-2 h-4 w-4" />
                <span>Create Organization</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
