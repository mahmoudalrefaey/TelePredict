import { Link, useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import axios from "axios";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Add new state variables for company information
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyContactNo, setCompanyContactNo] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [planType, setPlanType] = useState("basic");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);

    // Remove any lingering auth header before signup
    delete axios.defaults.headers.common['Authorization'];

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/client/register/", {
        company_id: parseInt(companyId),
        company_name: companyName,
        company_address: companyAddress,
        company_contact_no: companyContactNo,
        company_email: companyEmail,
        password: password,
        password2: confirmPassword,
        plan_type: planType
      });

      setSuccessMessage("Registration successful! Please log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          // Concatenate multiple error messages if they exist (common in DRF)
          const messages = Object.entries(errorData).map(([key, value]) => {
            if (Array.isArray(value)) {
              return `${key}: ${value.join(' ')}`;
            }
            return `${key}: ${value}`;
          }).join(' ');
          setError(messages || "Registration failed. Please check your input.");
        } else if (errorData.detail) {
           setError(errorData.detail);
        }
         else {
          setError("Registration failed. An unexpected error occurred.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Personal Information Section */}
            <div className="mb-4 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Company Information Section */}
            <div className="mb-4 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Company Information</h3>
              <div>
                <input
                  type="number"
                  id="company-id"
                  name="company-id"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Company ID"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="text"
                  id="company-name"
                  name="company-name"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="text"
                  id="company-address"
                  name="company-address"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Company Address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="tel"
                  id="company-contact"
                  name="company-contact"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Company Contact Number"
                  value={companyContactNo}
                  onChange={(e) => setCompanyContactNo(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  type="email"
                  id="company-email"
                  name="company-email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Company Email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="plan-type" className="sr-only">Plan Type</label>
                <select
                  id="plan-type"
                  name="plan-type"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  disabled={loading}
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="partner">Partner</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <div className="text-center mt-2">
          <Link to="/" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}