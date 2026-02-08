function HowItWorks() {
  const steps = [
    {
      icon: '📝',
      title: 'Describe Your Task',
      description: 'Tell us what you need help with—repairs, cleaning, moving, and more.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '👤',
      title: 'Choose Your Tasker',
      description: 'Browse profiles, compare ratings, and select the best professional for your job.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '✅',
      title: 'Get It Done',
      description: 'Your Tasker arrives and gets the job done efficiently and reliably.',
      gradient: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get things done in three simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className={`relative bg-gradient-to-br ${step.gradient} text-white rounded-2xl w-20 h-20 flex items-center justify-center mb-6 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                    <div className="absolute -top-2 -right-2 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md">{index + 1}</div>
                  </div>
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
