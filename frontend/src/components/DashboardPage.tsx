import React from 'react';
import CompanyDashboard from './CompanyDashboard';
import StaffDashboard from './StaffDashboard';

const DashboardPage: React.FC = () => {
  const userType = localStorage.getItem('userType');
  if (userType === 'client') {
    return <CompanyDashboard />;
  }
  if (userType === 'staff') {
    return <StaffDashboard />;
  }
  return <div className="text-center mt-8 text-lg">Please log in to view your dashboard.</div>;
};

export default DashboardPage; 