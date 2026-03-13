function TrustSafetySection() {
  return (
    <section className="py-12 bg-teal-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 px-4">
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h2 className="text-2xl md:text-3xl font-bold text-teal-700 mb-4">Trust & Safety</h2>
          <ul className="space-y-4 text-gray-700 mb-6">
            <li className="flex items-start"><span className="text-2xl mr-3">🔒</span> <span>All Taskers are background checked and vetted for your peace of mind.</span></li>
            <li className="flex items-start"><span className="text-2xl mr-3">🛡️</span> <span>Secure payments and customer support for every booking.</span></li>
            <li className="flex items-start"><span className="text-2xl mr-3">🌟</span> <span>Ratings and reviews help you choose the best Tasker for your needs.</span></li>
          </ul>
          <a href="#safety" className="text-teal-700 font-semibold hover:underline">Learn more about safety</a>
        </div>
        <div className="flex-1 mt-8 md:mt-0">
          <img src="https://images.pexels.com/photos/897817/pexels-photo-897817.jpeg?auto=compress&w=400&h=300&fit=crop" alt="Nigerian handyman with tools" className="rounded-xl shadow-lg w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

export default TrustSafetySection;
