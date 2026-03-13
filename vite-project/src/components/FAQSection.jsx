function FAQSection() {
  return (
    <section className="py-12 bg-white">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-teal-700 mb-10">Frequently Asked Questions</h2>
      <div className="max-w-3xl mx-auto space-y-6 px-4">
        <div>
          <h3 className="font-semibold text-teal-700 mb-2">How do I book a service?</h3>
          <p className="text-gray-700">Simply click the "Book a Service" button, describe your task, and choose a Tasker that fits your needs.</p>
        </div>
        <div>
          <h3 className="font-semibold text-teal-700 mb-2">Are the Taskers background checked?</h3>
          <p className="text-gray-700">Yes, all Taskers go through a thorough vetting and background check process before joining NAIJA-REPAIR.</p>
        </div>
        <div>
          <h3 className="font-semibold text-teal-700 mb-2">What if I’m not satisfied with the service?</h3>
          <p className="text-gray-700">Your satisfaction is our priority. Contact our support team and we’ll help resolve any issues quickly.</p>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
