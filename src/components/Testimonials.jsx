function Testimonials() {
  const testimonials = [
    {
      name: 'Emeka O.',
      role: 'Homeowner',
      image: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&w=128&h=128&fit=facearea&facepad=2',
      text: 'NAIJA-REPAIR made it so easy to find a reliable handyman. Fast and professional service!',
      rating: 5
    },
    {
      name: 'Aisha B.',
      role: 'Apartment Owner',
      image: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&w=128&h=128&fit=facearea&facepad=2',
      text: 'I booked a cleaner in minutes. My apartment has never looked better! Highly recommend.',
      rating: 5
    },
    {
      name: 'Tunde A.',
      role: 'Business Owner',
      image: 'https://images.pexels.com/photos/897817/pexels-photo-897817.jpeg?auto=compress&w=128&h=128&fit=facearea&facepad=2',
      text: 'Great service and trustworthy professionals. This platform is a game-changer!',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Join thousands of satisfied customers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 transform hover:-translate-y-2">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-100" />
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
  );
}

export default Testimonials;
