import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from './AuthContext';
import axios from 'axios';

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { isAuthenticated, userType } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isAuthenticated && userType === 'client') {
        // Submit to feedback API
        const token = localStorage.getItem('authToken');
        const response = await axios.post('http://127.0.0.1:8000/api/client/feedback/', {
          feedback_score: rating,
          client_complaints: message || 'Contact form submission'
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccess('Thank you for your feedback! We will get back to you soon.');
        setRating(0);
        setMessage("");
      } else {
        // For non-authenticated users, just show success message
        setSuccess('Thank you for your message! We will get back to you soon.');
        setRating(0);
        setMessage("");
        setName("");
        setEmail("");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Failed to submit feedback. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const filled = starNumber <= (hoveredRating || rating);
      
      return (
        <button
          key={starNumber}
          type="button"
          onClick={() => setRating(starNumber)}
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          className="text-2xl transition-colors duration-200"
        >
          <Star
            className={`h-8 w-8 ${
              filled ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isAuthenticated && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required={!isAuthenticated}
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required={!isAuthenticated}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate your experience (1-5 stars)
              </label>
              <div className="flex items-center space-x-1">
                {renderStars()}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {rating > 0 ? `You rated us ${rating} star${rating > 1 ? 's' : ''}` : 'Click on a star to rate'}
              </p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message (Optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Tell us more about your experience or ask us anything..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

