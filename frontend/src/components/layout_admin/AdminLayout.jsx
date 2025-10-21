import React, { useState } from 'react';
import AdminSidebarModern from './AdminSidebarModern';
import AdminHeader from './AdminHeader';

/**
 * Layout utama untuk halaman admin
 * Menyediakan struktur sidebar + header + content area
 */
const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebarModern isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content area - dengan margin left untuk desktop */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Header */}
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content with proper spacing */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;