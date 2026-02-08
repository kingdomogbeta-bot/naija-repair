import { Link } from 'react-router-dom';

function BecomeTaskerSection() {
  const benefits = [
    { icon: '💰', title: 'Set your own rates', description: 'You decide how much you charge' },
    { icon: '⏰', title: 'Flexible schedule', description: 'Work when you want, where you want' },
    { icon: '⚡', title: 'Quick payments', description: 'Get paid fast and securely' },
    { icon: '🤝', title: 'Build your business', description: 'Grow your client base locally' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional tasker"
                className="rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-600">₦50k+</p>
                  <p className="text-sm text-gray-600">Avg. monthly earnings</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Become a Tasker</h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Earn money on your own schedule by helping people in your community with repairs, cleaning, moving, and more.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-3xl">{benefit.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link
              to="/become-tasker"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign Up as a Tasker
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BecomeTaskerSection;
