import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useState, ChangeEvent } from "react";

interface ApiResponse {
  preview: any[];
  columns: string[];
  upload_id: number;
  total_rows?: number;
  filename?: string;
  has_customer_ids?: boolean;
}

interface PredictionResult {
  results: any[];
  summary: {
    total_customers: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
}

export default function PredictionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setApiResponse(null);
      setPrediction(null);
      setError(null);
      setUploadSuccessMessage(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setPrediction(null);
    setUploadSuccessMessage(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("Authentication token not found. Please log in.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/staff/upload/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
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
      const uploadResult = await response.json();
      setApiResponse(uploadResult);
      setUploadSuccessMessage("File uploaded successfully! Ready for prediction.");
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!apiResponse?.upload_id) {
      setError("No upload ID found. Please upload a file first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setPrediction(null);
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("Authentication token not found. Please log in.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/staff/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ upload_id: apiResponse.upload_id }),
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
      const predictionResult = await response.json();
      setPrediction(predictionResult);
    } catch (err: any) {
      setError(err.message || "Failed to get prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!apiResponse?.upload_id) {
      setError("No upload ID found. Please upload and predict first.");
      return;
    }
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      setError("Authentication token not found. Please log in.");
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/staff/export/${apiResponse.upload_id}/`, {
        method: "GET",
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
      a.download = `prediction_results_${apiResponse.upload_id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Failed to export results.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Churn Prediction</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Upload Data</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Choose File
                </label>
                <input id="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                <p className="mt-2 text-sm text-gray-500">or drag and drop (drag and drop not implemented yet)</p>
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600">Selected file: {selectedFile.name}</p>
                )}
              </div>
              {selectedFile && (
                <button
                  onClick={handleFileUpload}
                  disabled={isLoading}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isLoading ? "Uploading..." : "Upload File"}
                </button>
              )}
            </div>
            {error && (
              <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
            )}
            {uploadSuccessMessage && (
              <p className="mt-4 text-sm text-green-600 text-center">{uploadSuccessMessage}</p>
            )}
          </div>

          {apiResponse && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-2">Processed Data Preview</h2>
              <p className="text-sm text-gray-600 mb-4">First 5 rows of the processed data:</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {apiResponse.columns.map((colName, index) => (
                        <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {colName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apiResponse.preview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {apiResponse.columns.map((colName, colIndex) => (
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {String(row[colName])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className="text-lg font-semibold mt-6 mb-2">Column Names</h3>
              <ul className="list-disc list-inside pl-5 text-sm text-gray-700">
                {apiResponse.columns.map((colName, index) => (
                  <li key={index}>{colName}</li>
                ))}
              </ul>
              <div className="mt-6 text-center">
                <button
                  onClick={handlePredict}
                  disabled={isLoading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {isLoading ? "Predicting..." : "Run Prediction"}
                </button>
              </div>
            </div>
          )}

          {prediction && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">Total Customers</span>
                  <span className="text-gray-600">{prediction.summary.total_customers}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">High Risk Customers</span>
                  <span className="text-gray-600">{prediction.summary.high_risk_count}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">Medium Risk Customers</span>
                  <span className="text-gray-600">{prediction.summary.medium_risk_count}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                  <span className="font-medium">Low Risk Customers</span>
                  <span className="text-gray-600">{prediction.summary.low_risk_count}</span>
                </div>
              </div>
              {apiResponse?.upload_id && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleExport}
                    className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700"
                  >
                    Export Results (CSV)
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

