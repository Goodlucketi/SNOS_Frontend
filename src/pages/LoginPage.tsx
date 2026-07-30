import React from 'react';
import Login from '../components/Login';
import Navbar from '../components/Navbar';

const LoginPage: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <Login />
    </main>
  );
};

export default LoginPage;
