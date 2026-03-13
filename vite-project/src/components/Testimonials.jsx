import { useState, useEffect } from 'react';

// Subtle animations
const styles = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
`;

function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.dataset.section === 'testimonials') {
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

    const section = document.querySelector('[data-section="testimonials"]');
    const cards = document.querySelectorAll('[data-card-id^="testimonial-"]');
    
    if (section) observer.observe(section);
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, []);
  const testimonials = [
    {
      name: 'Emeka O.',
      role: 'Homeowner',
      image: '/reviewers/images 1.jpg',
      text: 'NAIJA-REPAIR made it so easy to find a reliable handyman. Fast and professional service!',
      rating: 5
    },
    {
      name: 'Aisha B.',
      role: 'Apartment Owner',
      image: '/reviewers/image-1772023283543.png',
      text: 'I booked a cleaner in minutes. My apartment has never looked better! Highly recommend.',
      rating: 5
    },
    {
      name: 'Tunde A.',
      role: 'Business Owner',
      image: '/reviewers/images.jpg',
      text: 'Great service and trustworthy professionals. This platform is a game-changer!',
      rating: 5
    }
  ];

  return (
    <>
      <style>{styles}</style>
      <section className="py-20 bg-gradient-to-br from-teal-50 to-white" data-section="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                data-card-id={`testimonial-${index}`}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 transform hover:-translate-y-2 relative overflow-hidden ${
                  animatedCards.has(`testimonial-${index}`) 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center mb-4 relative z-10">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg 
                      key={i} 
                      className="w-5 h-5 text-yellow-400 fill-current" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic relative z-10">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center relative z-10">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-teal-100" 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full w-4 h-4 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
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

export default Testimonials;
