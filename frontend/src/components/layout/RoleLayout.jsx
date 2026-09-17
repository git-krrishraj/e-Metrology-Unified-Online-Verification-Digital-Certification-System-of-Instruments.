import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';

export const RoleLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Background ambient radial glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="hidden dark:block absolute -top-40 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="hidden dark:block absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="block dark:hidden absolute -top-40 right-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
