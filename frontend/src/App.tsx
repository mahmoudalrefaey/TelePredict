import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/login-page';
import ContactPage from './components/contact-page';
import PredictionPage from './components/prediction-page';
import TelePredictLanding from './components/telepredict-landing';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<TelePredictLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/prediction" element={<PredictionPage />} />
    </Routes>
  );
};

export default App; 