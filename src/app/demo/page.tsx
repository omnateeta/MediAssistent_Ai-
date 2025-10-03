import Image from "next/image";
import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
        <Image src="/globe.svg" alt="Demo" width={80} height={80} className="mb-4" />
        <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">Smart Medical AI Assistant Demo</h1>
        <p className="text-gray-700 mb-6 text-center">
          Experience how our AI-powered assistant streamlines healthcare for doctors and patients. This is a demo page. You can customize this section to include a video, screenshots, or interactive walkthrough of your platform.
        </p>
        <Link href="/" className="text-blue-600 hover:underline font-medium">Back to Home</Link>
      </div>
    </div>
  );
}
