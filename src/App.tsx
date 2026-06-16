/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { CustomerHome } from './components/CustomerHome';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdminRoute = currentPath === '/admiin' || currentPath === '/admiin/';

  const handleNavigateToCustomer = () => {
    setAdminAuthenticated(false);
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  const handleAdminLoginSuccess = () => {
    setAdminAuthenticated(true);
  };

  return (
    <StoreProvider>
      {isAdminRoute ? (
        adminAuthenticated ? (
          <AdminDashboard onNavigateToCustomer={handleNavigateToCustomer} />
        ) : (
          <AdminLogin onLoginSuccess={handleAdminLoginSuccess} onCancel={handleNavigateToCustomer} />
        )
      ) : (
        <CustomerHome />
      )}
    </StoreProvider>
  );
}

