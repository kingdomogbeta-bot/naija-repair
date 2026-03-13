export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Under Maintenance
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              We're currently performing scheduled maintenance to improve your experience.
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <p className="text-gray-700 font-medium mb-2">
                🔧 What's happening?
              </p>
              <p className="text-gray-600 text-sm">
                Our team is working hard to upgrade our systems and add new features. We'll be back online shortly!
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Systems updating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Database optimizing</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-gray-600 mb-4">Need immediate assistance?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="mailto:support@naija-repair.com"
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all"
                >
                  📧 Email Support
                </a>
                <a
                  href="tel:+2348012345678"
                  className="px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-all"
                >
                  📞 Call Us
                </a>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-8">
              Expected downtime: 30 minutes - 2 hours
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-gray-500">
          <a href="#" className="hover:text-teal-600 transition-colors">Twitter</a>
          <a href="#" className="hover:text-teal-600 transition-colors">Facebook</a>
          <a href="#" className="hover:text-teal-600 transition-colors">Instagram</a>
        </div>
      </div>
    </div>
  );
}
