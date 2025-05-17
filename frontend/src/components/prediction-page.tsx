import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

export default function PredictionPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Churn Prediction</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Data</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Choose File
                </label>
                <input id="file-upload" type="file" className="hidden" />
                <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Prediction Results</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Total Customers</span>
                <span className="text-gray-600">0</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Churn Risk</span>
                <span className="text-gray-600">0%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">High Risk Customers</span>
                <span className="text-gray-600">0</span>
              </div>
            </div>
          </div>

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

