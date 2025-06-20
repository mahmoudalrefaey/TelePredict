import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useState, FormEvent } from "react"; // Import useState and FormEvent
import axios from "axios"; // Import axios
import { useEffect } from "react";
import { useAuth } from './AuthContext';

// Add a simple JWT decode function
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const [userType, setUserType] = useState<'client' | 'staff'>('client');
  const [idInput, setIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let endpoint = "";
      let data: any = { password };
      if (userType === 'client') {
        endpoint = "http://localhost:8000/api/client/login/";
        data.company_id = idInput;
      } else {
        endpoint = "http://localhost:8000/api/staff/login/";
        data.staff_id = idInput;
      }
      const response = await axios.post(endpoint, data);
      const token = response.data.token;
      if (token) {
        // Decode the token to get the name/company_name
        const decoded = decodeJWT(token);
        let displayName = idInput;
        if (decoded) {
          if (userType === 'client' && decoded.company_name) {
            displayName = decoded.company_name;
          } else if (userType === 'staff' && decoded.name) {
            displayName = decoded.name;
          }
        }
        login(token, userType, idInput, displayName);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate("/");
      } else {
        setError("Login failed: No token received from server.");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (errorData.detail) {
          setError(errorData.detail);
        } else if (typeof errorData === 'object' && errorData !== null) {
          const messages = Object.values(errorData).flat().join(' ');
          setError(messages || "Login failed. Please check your credentials.");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="mb-4 flex justify-center gap-4">
            <button
              type="button"
              className={`px-4 py-2 rounded ${userType === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setUserType('client')}
              disabled={loading}
            >
              Client
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded ${userType === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setUserType('staff')}
              disabled={loading}
            >
              Staff
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="id-input" className="sr-only">
                {userType === 'client' ? 'Company ID' : 'Staff ID'}
              </label>
              <input
                id="id-input"
                name="id-input"
                type={userType === 'client' ? 'number' : 'text'}
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={userType === 'client' ? 'Company ID' : 'Staff ID'}
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500"> {/* Updated href for accessibility */}
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4"> {/* Added margin-top for spacing */}
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center mt-2"> {/* Added margin-top for spacing */}
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

