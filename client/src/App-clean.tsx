import React from 'react';
import { EkalavyaAuthProvider, useEkalavyaAuth } from '@/context/ekalavya-auth';
import LoginClean from '@/pages/login-clean';
import DashboardFixed from '@/pages/dashboard-fixed';

// Main App Component
const App: React.FC = () => {
  return (
    <EkalavyaAuthProvider>
      <AuthWrapper />
    </EkalavyaAuthProvider>
  );
};

const AuthWrapper: React.FC = () => {
  const { user } = useEkalavyaAuth();
  
  return user ? <DashboardFixed /> : <LoginClean />;
};

export default App;