import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NavBar from './NavBar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 768);
  const { currentUser } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinkClass = (isActive) => {
    return `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'text-white bg-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 md:hidden" 
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar - Primary Navigation */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transition-all duration-300 ease-in-out transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col border-r border-gray-200 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="text-2xl font-bold text-primary-600">HealthPal</div>
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Primary Navigation Links */}
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              {/* Core Patient Features */}
              <NavLink to="/home" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </NavLink>
              
              <NavLink to="/find-doctor" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Doctor
              </NavLink>
              
              <NavLink to="/appointments" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Appointments
              </NavLink>
              
              <NavLink to="/prescriptions" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Prescriptions
              </NavLink>
              
              <NavLink to="/medical-records" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medical Records
              </NavLink>
              
              {/* Help section divider */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <h3 className="px-3 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  Resources
                </h3>
              </div>
              
              <NavLink to="/health-articles" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                Health Articles
              </NavLink>
              
              <NavLink to="/health-tips" className={({isActive}) => navLinkClass(isActive)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Health Tips
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div 
        className="flex flex-col flex-1 transition-all duration-300 ease-in-out"
        style={{
          width: '100%',
          marginLeft: sidebarOpen ? '16rem' : '0'
        }}
      >
        <NavBar toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-auto py-6 px-4 sm:px-6 lg:px-8 mt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;