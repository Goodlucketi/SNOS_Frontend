import React from 'react';
import DashView from '../components/DashView';

const Dashboard: React.FC = () => {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <DashView />
    </main>
  );
};

export default Dashboard;
