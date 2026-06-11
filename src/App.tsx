/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { CustomerHome } from './components/CustomerHome';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [adminMode, setAdminMode] = useState<boolean>(false);

  return (
    <StoreProvider>
      {adminMode ? (
        <AdminDashboard onNavigateToCustomer={() => setAdminMode(false)} />
      ) : (
        <CustomerHome onNavigateToAdmin={() => setAdminMode(true)} />
      )}
    </StoreProvider>
  );
}

