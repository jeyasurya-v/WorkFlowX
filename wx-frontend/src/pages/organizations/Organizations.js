import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaUsers, FaEllipsisH } from 'react-icons/fa';

const Organizations = () => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // This would be replaced with actual API call
    const fetchOrganizations = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setOrganizations([
            {
              id: 'org1',
              name: 'Acme Corp',
              role: 'admin',
              members: 12,
              pipelines: 8,
              createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'org2',
              name: 'Globex Inc',
              role: 'member',
              members: 24,
              pipelines: 15,
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            },
            {
              id: 'org3',
              name: 'Initech',
              role: 'viewer',
              members: 8,
              pipelines: 5,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Filter organizations by search term
  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'apple-badge bg-[var(--color-gray-100)] text-[var(--color-gray-600)]'; // Use neutral gray for admin
      case 'member':
        return 'apple-badge apple-badge-success'; // Use green for member
      case 'viewer':
        return 'apple-badge bg-[var(--color-gray-100)] text-[var(--color-gray-600)]'; // Use neutral gray for viewer
      default:
        return 'apple-badge bg-[var(--color-gray-100)] text-[var(--color-gray-600)]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">Organizations</h1>
        <Link to="/organizations/new" className="apple-btn apple-btn-primary hover-lift">
          <FaPlus className="mr-2 -ml-1 h-4 w-4" />
          New Organization
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-[var(--color-gray-400)]" />
        </div>
        <input
          type="text"
          className="apple-input pl-10"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Organizations list */}
      {filteredOrganizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrganizations.map((org) => (
            <div key={org.id} className="apple-card bg-white p-0 flex flex-col">
              <div className="p-4 border-b border-[var(--color-gray-200)] flex justify-between items-center">
                <Link to={`/organizations/${org.id}`} className="text-lg font-medium text-[var(--color-black)] hover:text-[var(--color-blue)]">
                  {org.name}
                </Link>
                <div className="relative">
                  <button className="text-[var(--color-gray-500)] hover:text-[var(--color-black)] p-1 hover-lift">
                    <FaEllipsisH />
                  </button>
                  {/* Add dropdown menu here if needed */}
                </div>
              </div>
              <div className="p-4 flex-grow">
                <div className="mb-4">
                  <span className={`${getRoleBadgeClass(org.role)}`}>
                    {org.role.charAt(0).toUpperCase() + org.role.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-gray-600)]">Members</p>
                    <p className="text-lg font-semibold text-[var(--color-black)] flex items-center">
                      <FaUsers className="mr-1.5 text-[var(--color-gray-400)]" />
                      {org.members}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-gray-600)]">Pipelines</p>
                    <p className="text-lg font-semibold text-[var(--color-black)]">
                      {org.pipelines}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-[var(--color-gray-500)]">Created on {formatDate(org.createdAt)}</p>
                </div>
              </div>
              <div className="p-4 border-t border-[var(--color-gray-200)] mt-auto">
                <Link to={`/organizations/${org.id}`} className="apple-btn apple-btn-secondary w-full text-sm hover-lift">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="apple-card bg-white p-8 text-center">
          <p className="text-[var(--color-gray-600)]">
            {searchTerm 
              ? 'No organizations match your search criteria.' 
              : 'No organizations found. Create your first organization to get started.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link to="/organizations/new" className="apple-btn apple-btn-secondary hover-lift">
                <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                New Organization
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Organizations;
