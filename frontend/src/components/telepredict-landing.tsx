import { Link } from "react-router-dom"; // Changed from 'next/link'
import { Cloud, BarChart3, Network } from "lucide-react";
import { useState, useEffect } from 'react'; // Added imports
import img1 from '../assets/images/1.svg';
import img2 from '../assets/images/2.svg';
import { useAuth } from './AuthContext';

export default function TelePredictLanding() {
  const [username, setUsername] = useState<string | null>(null);
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    // Check for auth token and username in localStorage
    const token = localStorage.getItem("authToken");
    const storedUsername = localStorage.getItem("username");

    if (token && storedUsername) {
      setUsername(storedUsername);
    }

    // Listen for storage changes to update UI if login/logout happens in another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "authToken" || event.key === "username") {
        const currentToken = localStorage.getItem("authToken");
        const currentUsername = localStorage.getItem("username");
        if (currentToken && currentUsername) {
          setUsername(currentUsername);
        } else {
          setUsername(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    localStorage.removeItem("userType");
    localStorage.removeItem("userId");
    setUsername(null);
    // Optionally, navigate to login page or home page
    // import { useNavigate } from 'react-router-dom';
    // const navigate = useNavigate();
    // navigate('/login');
  };

  // Determine where Get Started should go
  const getStartedLink = isAuthenticated && userType === 'client' ? '/dashboard' : '/prediction';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header removed; now provided by Layout component */}

      <main>
        {/* Hero Section */}
        <section className="bg-indigo-700 rounded-b-3xl">
          <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pink-500 mb-4">
                Predict Customer Churn with Precision
              </h1>
              <p className="text-white text-lg mb-6">
                Empower your telecom business with actionable insights to reduce churn and boost retention.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to={getStartedLink}>
                  <button className="bg-white text-indigo-700 px-6 py-2 rounded font-medium">Get Started</button>
                </Link>
                <Link to="/about">
                  <button className="border border-white text-white px-6 py-2 rounded font-medium">Learn More</button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Use imported SVG image 1 */}
              <img
                src={img1}
                alt="Data visualization illustration"
                style={{ width: '400px', height: '300px' }}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">What We Do</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <Cloud className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload your data effortlessly</h3>
              <p className="text-gray-600 text-sm">
                Drag and drop your files or CSV of Excel format. Easily set up automatic data collection to ensure a
                seamless experience.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <Network className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Accurate Churn Predictions with AI</h3>
              <p className="text-gray-600 text-sm">
                Our advanced machine learning models analyze your data to predict which customers are most likely to
                churn, with remarkable accuracy.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Insights with Charts</h3>
              <p className="text-gray-600 text-sm">
                Explore intuitive dashboards with chart trends, demographic breakdowns, and actionable insights to make
                data-driven decisions.
              </p>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              {/* Use imported SVG image 2 */}
              <img
                src={img2}
                alt="Data analysis illustration"
                style={{ width: '350px', height: '300px' }}
                className="w-full"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Help Your Business Thrive</h2>
              <p className="text-gray-600">
                Leverage advanced AI-powered insights to predict customer churn, make valuable connections, and boost
                your revenue. Our solution simplifies data analysis, transforms complex information into actionable
                visualizations that empower you to make informed decisions with confidence.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      
    </div>
  )
}

