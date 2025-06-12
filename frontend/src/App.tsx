import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/login-page';
import ContactPage from './components/contact-page';
import PredictionPage from './components/prediction-page';
import TelePredictLanding from './components/telepredict-landing';
import SignupPage from './components/signup-page'; // Import the new SignupPage component
import Layout from './components/Layout';
import DashboardPage from './components/DashboardPage';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TelePredictLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/prediction" element={<PredictionPage />} />
        <Route path="/signup" element={<SignupPage />} /> {/* Add route for the signup page */}
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Layout>
  );
};

export default App;