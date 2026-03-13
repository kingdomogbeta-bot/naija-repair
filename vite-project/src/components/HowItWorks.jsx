import { useState, useEffect } from 'react';

// Subtle animations
const styles = `
  @keyframes slideInUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  .animate-slide-in-up {
    animation: slideInUp 0.6s ease-out;
  }
`;

function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.dataset.section === 'how-it-works') {
              setIsVisible(true);
            }
            if (entry.target.dataset.cardId) {
              setAnimatedCards(prev => new Set([...prev, entry.target.dataset.cardId]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const section = document.querySelector('[data-section="how-it-works"]');
    const cards = document.querySelectorAll('[data-card-id]');
    
    if (section) observer.observe(section);
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);
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
    <>
      <style>{styles}</style>
      <section className="py-20 bg-gradient-to-b from-white to-gray-50" data-section="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get things done in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative group"
                data-card-id={`step-${index}`}
              >
                <div className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 ${
                  animatedCards.has(`step-${index}`) 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative bg-gradient-to-br ${step.gradient} text-white rounded-2xl w-20 h-20 flex items-center justify-center mb-6 text-4xl shadow-lg group-hover:scale-110 transition-all duration-300`}>
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
    </>
  );
}

export default HowItWorks;
