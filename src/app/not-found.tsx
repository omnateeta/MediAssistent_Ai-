import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a6 6 0 016-6v0a6 6 0 016 6v0"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              Back to Home
            </Button>
          </Link>
          
          <div className="flex space-x-4">
            <Link href="/patient" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-2 px-4 rounded-lg transition-all duration-200"
              >
                Patient Portal
              </Button>
            </Link>
            <Link href="/doctor" className="flex-1">
              <Button
                variant="outline"
                className="w-full border-green-300 text-green-700 hover:bg-green-50 py-2 px-4 rounded-lg transition-all duration-200"
              >
                Doctor Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need assistance? Contact our support team
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a
              href="mailto:support@mediassist.ai"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Email Support
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}