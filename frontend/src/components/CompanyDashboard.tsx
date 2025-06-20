import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, CreditCard, Plus, AlertCircle } from 'lucide-react';

interface StaffMember {
  staff_id: string;
  name: string;
  email: string;
}

interface Subscription {
  subscription_id: number;
  plan_type: 'basic' | 'standard' | 'partner';
  monthly_charges: number;
  total_charges: number;
  plan_duration: number;
  monthly_rate: number;
  total_charge: number;
  max_staff_allowed: number;
  start_date: string;
  end_date: string;
  active: boolean;
}

interface CompanyProfile {
  client_info: {
    company_id: number;
    company_name: string;
    company_email: string;
    company_address: string;
    company_contact_no: string;
  };
  staff_members: StaffMember[];
  subscriptions: Subscription[];
}

const CompanyDashboard: React.FC = () => {
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<any>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setProfileError('Authentication required');
        return;
      }

      const response = await axios.get('http://127.0.0.1:8000/api/client/profile/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(response.data);
    } catch (err) {
      setProfileError('Failed to load company profile');
      console.error('Profile fetch error:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('You must be logged in as a company to register staff.');
        setLoading(false);
        return;
      }

      if (profile?.subscriptions[0]) {
        const currentStaff = profile.staff_members.length;
        const maxAllowed = profile.subscriptions[0].max_staff_allowed;
        if (maxAllowed !== null && currentStaff >= maxAllowed) {
          setError(`Cannot add more staff. Your ${profile.subscriptions[0].plan_type} plan allows maximum ${maxAllowed} staff members.`);
          setLoading(false);
          return;
        }
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/client/add-staff/',
        {
          staff_id: staffId,
          name,
          email,
          password,
          password2,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('Staff registered successfully!');
      setStaffId('');
      setName('');
      setEmail('');
      setPassword('');
      setPassword2('');
      setShowAddStaff(false);
      fetchCompanyProfile();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        if (typeof errorData === 'object' && errorData !== null) {
          // Collect all error messages
          let messages = [];
          if (errorData.detail) {
            messages.push(errorData.detail);
          }
          Object.entries(errorData).forEach(([key, value]) => {
            if (key !== 'detail') {
              if (Array.isArray(value)) {
                value.forEach((msg) => messages.push(`${key}: ${msg}`));
              } else {
                messages.push(`${key}: ${value}`);
              }
            }
          });
          setError(messages.join(' '));
          setFieldErrors(errorData);
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError('Failed to register staff member');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="h-12 w-12" />
          </div>
          <p className="text-center text-gray-700">{profileError}</p>
        </div>
      </div>
    );
  }

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'standard':
        return 'bg-purple-100 text-purple-800';
      case 'partner':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your company profile and staff members</p>
        </div>

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Company Profile Card */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Company Profile</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">{profile.client_info.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company ID</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">{profile.client_info.company_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">{profile.client_info.company_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">{profile.client_info.company_contact_no}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">{profile.client_info.company_address}</p>
                  </div>
                </div>
              </div>

              {/* Staff Members Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-indigo-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Staff Members</h2>
                  </div>
                  <button
                    onClick={() => setShowAddStaff(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.staff_members.map((staff) => (
                        <tr key={staff.staff_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.staff_id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="lg:col-span-1">
              {profile.subscriptions[0] && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <CreditCard className="h-8 w-8 text-indigo-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">Subscription</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-500">Plan Type</p>
                      <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(profile.subscriptions[0].plan_type)}`}>
                        {profile.subscriptions[0].plan_type.charAt(0).toUpperCase() + profile.subscriptions[0].plan_type.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {profile.subscriptions[0].active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Rate</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">${profile.subscriptions[0].monthly_rate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Charges</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">${profile.subscriptions[0].total_charge}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {new Date(profile.subscriptions[0].start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {new Date(profile.subscriptions[0].end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Staff Limit</p>
                      <p className="mt-1 text-lg font-medium text-gray-900">
                        {profile.subscriptions[0].max_staff_allowed === null 
                          ? 'Unlimited' 
                          : `${profile.staff_members.length}/${profile.subscriptions[0].max_staff_allowed}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Staff Modal */}
        {showAddStaff && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Add New Staff Member</h3>
                <button
                  onClick={() => setShowAddStaff(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              {fieldErrors && typeof fieldErrors === 'object' && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
                  <ul className="list-disc pl-5">
                    {Object.entries(fieldErrors).map(([key, value]) => (
                      key !== 'detail' && Array.isArray(value) ? value.map((msg, idx) => (
                        <li key={key + idx}><strong>{key}:</strong> {msg}</li>
                      )) : null
                    ))}
                  </ul>
                </div>
              )}
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="staff-id" className="block text-sm font-medium text-gray-700">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    id="staff-id"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="password2" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="password2"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddStaff(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Staff Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard; 