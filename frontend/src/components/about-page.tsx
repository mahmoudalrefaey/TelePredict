import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4 text-center">About TelePredict</h1>
        <p className="text-lg text-gray-700 mb-8 text-center">
          TelePredict empowers telecom businesses to reduce customer churn and boost retention using advanced AI and data-driven insights. Our mission is to make predictive analytics accessible, actionable, and impactful for every telecom provider.
        </p>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Mission</h2>
          <p className="text-gray-600">
            We believe in the power of data to transform businesses. Our goal is to help telecom companies understand their customers, predict churn before it happens, and take proactive steps to build lasting relationships. We combine cutting-edge machine learning with intuitive dashboards to deliver insights you can trust.
          </p>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Choose TelePredict?</h2>
          <ul className="list-disc pl-6 space-y-3 text-gray-700">
            <li><span className="font-semibold text-indigo-700">Advanced Technology:</span> We leverage state-of-the-art AI and machine learning models to deliver highly accurate churn predictions.</li>
            <li><span className="font-semibold text-indigo-700">Actionable Insights:</span> Our dashboards turn complex data into clear, actionable recommendations for your business.</li>
            <li><span className="font-semibold text-indigo-700">Customer-Centric Approach:</span> We design our solutions with your needs in mind, ensuring ease of use and real business impact.</li>
            <li><span className="font-semibold text-indigo-700">Data Security:</span> Your data privacy and security are our top priorities. We use industry best practices to keep your information safe.</li>
            <li><span className="font-semibold text-indigo-700">Dedicated Support:</span> Our support team is always ready to help you get the most out of TelePredict, from onboarding to ongoing optimization.</li>
            <li><span className="font-semibold text-indigo-700">Continuous Improvement:</span> We are committed to innovation, regularly updating our platform with new features and improvements based on your feedback.</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Values</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Integrity and transparency in all our operations</li>
            <li>Empowering clients through knowledge and technology</li>
            <li>Building long-term partnerships with our customers</li>
            <li>Driving innovation in telecom analytics</li>
          </ul>
        </div>
        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} TelePredict. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
} 