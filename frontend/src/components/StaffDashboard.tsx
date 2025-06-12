import React, { useState, useEffect } from 'react';

interface HistoryItem {
  id: number;
  filename: string;
  upload_date: string;
  status: string;
}

const StaffDashboard: React.FC = () => {
  const [tab, setTab] = useState<'powerbi' | 'history'>('powerbi');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<number | null>(null);
  const [iframeError, setIframeError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'history') {
      fetchHistory();
    }
  }, [tab]);

  const handleIframeError = () => {
    setIframeError('Failed to load PowerBI dashboard. Please try refreshing the page.');
    console.error('PowerBI iframe failed to load');
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setHistoryError('Authentication token not found. Please log in.');
      setLoadingHistory(false);
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/staff/history/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to fetch history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExport = async (uploadId: number) => {
    setExportingId(uploadId);
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('Authentication token not found. Please log in.');
      setExportingId(null);
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/staff/export/${uploadId}/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prediction_results_${uploadId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to export results.');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col items-center bg-white">
      {/* Mini Nav Tabs */}
      <div className="w-full flex justify-center border-b mb-4 bg-gray-50">
        <button
          className={`px-6 py-3 font-medium ${tab === 'powerbi' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}
          onClick={() => setTab('powerbi')}
        >
          PowerBI Dashboard
        </button>
        <button
          className={`px-6 py-3 font-medium ${tab === 'history' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500 hover:text-indigo-600'}`}
          onClick={() => setTab('history')}
        >
          Prediction History
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full flex-1 flex flex-col items-center justify-center">
        {tab === 'powerbi' && (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {iframeError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
                {iframeError}
              </div>
            ) : (
              <iframe
                title="Churn Prediction Telecom"
                width="100%"
                height="800"
                src="https://app.powerbi.com/reportEmbed?reportId=2995d071-6012-4fe9-977a-6ae018453095&autoAuth=true&ctid=3330eacd-141e-4202-b2b6-13ba907fe575&actionBarEnabled=true&reportCopilotInEmbed=true"
                frameBorder="0"
                allowFullScreen={true}
                style={{ minHeight: '80vh', minWidth: '100vw', border: 'none', flex: 1 }}
                onError={handleIframeError}
              ></iframe>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="w-full max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Prediction History</h2>
            {loadingHistory ? (
              <div className="text-center text-gray-500">Loading history...</div>
            ) : historyError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">{historyError}</div>
            ) : history.length === 0 ? (
              <div className="bg-gray-100 p-6 rounded shadow text-gray-600 text-center">No prediction history found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filename</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Export</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.filename}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(item.upload_date).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <button
                            onClick={() => handleExport(item.id)}
                            className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:bg-gray-400"
                            disabled={exportingId === item.id}
                          >
                            {exportingId === item.id ? 'Exporting...' : 'Export'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard; 