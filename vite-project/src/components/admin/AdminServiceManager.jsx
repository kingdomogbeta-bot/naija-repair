import { useState, useEffect } from 'react';
import { getAllServices, createService, updateService, deleteService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function AdminServiceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { socket } = useSocket();
  const [categories] = useState(['All', 'Home', 'Repairs', 'Moving', 'Outdoor']);
  const [editingService, setEditingService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const DEFAULT_SERVICES = [
    { name: 'Home Cleaning', description: 'Professional deep cleaning services for homes and offices. Our experts ensure every corner sparkles.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop', features: ['Deep Cleaning', 'Regular Maintenance', 'Move-in/Move-out', 'Office Cleaning'], startingPrice: '₦2,500', category: 'Home', active: true },
    { name: 'Handyman Services', description: 'Expert repairs and maintenance for all your home improvement needs. From minor fixes to major projects.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop', features: ['General Repairs', 'Door & Window Fixes', 'Wall Repairs', 'Minor Installations'], startingPrice: '₦3,000', category: 'Repairs', active: true },
    { name: 'Electrical Work', description: 'Licensed electricians for safe and reliable electrical installations, repairs, and maintenance.', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop', features: ['Wiring & Rewiring', 'Light Installations', 'Circuit Repairs', 'Safety Inspections'], startingPrice: '₦4,000', category: 'Repairs', active: true },
    { name: 'Plumbing Services', description: 'Fast and reliable plumbing solutions for leaks, installations, and emergency repairs.', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop', features: ['Leak Repairs', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Service'], startingPrice: '₦3,500', category: 'Repairs', active: true },
    { name: 'Painting Services', description: 'Transform your space with professional interior and exterior painting services.', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop', features: ['Interior Painting', 'Exterior Painting', 'Color Consultation', 'Wall Preparation'], startingPrice: '₦2,800', category: 'Home', active: true },
    { name: 'Moving & Delivery', description: 'Reliable moving and delivery services with careful handling of your belongings.', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop', features: ['Local Moving', 'Packing Services', 'Furniture Delivery', 'Heavy Lifting'], startingPrice: '₦5,000', category: 'Moving', active: true },
    { name: 'Furniture Assembly', description: 'Quick and efficient furniture assembly for all types of flat-pack furniture.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', features: ['IKEA Assembly', 'Office Furniture', 'Bed Frames', 'Shelving Units'], startingPrice: '₦2,000', category: 'Home', active: true },
    { name: 'Gardening & Landscaping', description: 'Create and maintain beautiful outdoor spaces with our gardening experts.', image: 'https://plus.unsplash.com/premium_photo-1661423948734-f46aa74284e0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8R2FyZGVuaW5nJTIwJTI2JTIwTGFuZHNjYXBpbmd8ZW58MHx8MHx8fDA%3D', features: ['Lawn Maintenance', 'Garden Design', 'Tree Trimming', 'Irrigation Setup'], startingPrice: '₦3,000', category: 'Outdoor', active: true },
    { name: 'Carpentry', description: 'Custom woodwork and carpentry services for furniture, cabinets, and more.', image: 'https://images.unsplash.com/photo-1645651964715-d200ce0939cc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FycGVudHJ5fGVufDB8fDB8fHww', features: ['Custom Furniture', 'Cabinet Making', 'Door Installation', 'Wood Repairs'], startingPrice: '₦4,500', category: 'Repairs', active: true },
    { name: 'AC Installation & Repair', description: 'Professional air conditioning installation, maintenance, and repair services.', image: 'https://plus.unsplash.com/premium_photo-1682126009570-3fe2399162f7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWlyJTIwY29uZGl0aW9uZXJ8ZW58MHx8MHx8fDA%3D', features: ['AC Installation', 'Maintenance', 'Gas Refilling', 'Emergency Repairs'], startingPrice: '₦5,500', category: 'Repairs', active: true },
    { name: 'Pest Control', description: 'Effective pest control solutions to keep your home safe and pest-free.', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop', features: ['Fumigation', 'Termite Control', 'Rodent Removal', 'Preventive Treatment'], startingPrice: '₦6,000', category: 'Home', active: true },
    { name: 'Appliance Repair', description: 'Expert repair services for all household appliances and electronics.', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', features: ['Refrigerator Repair', 'Washing Machine', 'Microwave', 'TV Repair'], startingPrice: '₦3,500', category: 'Repairs', active: true },
    { name: 'Dry Cleaning & Laundry', description: 'Professional dry cleaning and laundry services with pickup and delivery options.', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=600&fit=crop', features: ['Ironing Only - ₦300/item', 'Wash & Iron - ₦500/item', 'Pickup & Delivery', 'Same Day Service'], startingPrice: '₦300', category: 'Home', active: true },
    { name: 'Car Wash & Detailing', description: 'Complete car washing and detailing services to keep your vehicle spotless.', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop', features: ['Exterior Wash', 'Interior Cleaning', 'Waxing & Polish', 'Engine Cleaning'], startingPrice: '₦3,000', category: 'Outdoor', active: true },
    { name: 'Catering Services', description: 'Professional catering for events, parties, and special occasions.', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop', features: ['Event Catering', 'Party Planning', 'Custom Menus', 'Professional Staff'], startingPrice: '₦15,000', category: 'Home', active: true },
    { name: 'Security Services', description: 'Reliable security guards and surveillance systems for homes and businesses.', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop', features: ['Security Guards', 'CCTV Installation', 'Alarm Systems', '24/7 Monitoring'], startingPrice: '₦8,000', category: 'Home', active: true }
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await getAllServices();
      console.log('AdminServiceManager - API response:', response);
      if (response.success) {
        console.log('AdminServiceManager - services data:', response.data);
        setServices(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('service_updated', fetchServices);
    return () => socket.off('service_updated');
  }, [socket]);

  const handleAddService = async (serviceData) => {
    try {
      const token = getToken();
      await createService(token, serviceData);
      setShowAddForm(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateService = async (serviceData) => {
    try {
      const token = getToken();
      await updateService(token, editingService._id, serviceData);
      setEditingService(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm('Delete this service?')) {
      try {
        const token = getToken();
        await deleteService(token, id);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      const token = getToken();
      await updateService(token, service._id, { ...service, active: !service.active });
    } catch (error) {
      alert(error.message);
    }
  };

  const seedDefaultServices = async () => {
    if (!confirm('This will add 16 default services to your database. Continue?')) return;
    
    setSeeding(true);
    try {
      const token = getToken();
      for (const service of DEFAULT_SERVICES) {
        await createService(token, service);
      }
      alert('Successfully added all default services!');
    } catch (error) {
      alert('Error seeding services: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Service Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          + Add Service
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">No services found in database.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={seedDefaultServices}
              disabled={seeding}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {seeding ? 'Adding Services...' : 'Add 16 Default Services'}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Add Custom Service
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-bold">{service.name}</h3>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      service.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service.active !== false ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs sm:text-sm">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-3">{service.description}</p>
                  <p className="text-sm sm:text-base font-semibold text-teal-600">{service.startingPrice}</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs sm:text-sm font-medium ${
                      service.active !== false 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {service.active !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setEditingService(service)}
                    className="flex-1 sm:flex-none px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs sm:text-sm hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="flex-1 sm:flex-none px-3 py-1 bg-red-100 text-red-700 rounded text-xs sm:text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddForm || editingService) && (
        <ServiceForm
          service={editingService}
          categories={categories}
          onSave={editingService ? handleUpdateService : handleAddService}
          onCancel={() => {
            setShowAddForm(false);
            setEditingService(null);
          }}
        />
      )}
    </div>
  );
}

function ServiceForm({ service, categories, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'Home',
    startingPrice: service?.startingPrice || '',
    image: service?.image || '',
    features: service?.features || [''],
    active: service?.active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      features: formData.features.filter(f => f.trim())
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    setFormData({ 
      ...formData, 
      features: formData.features.filter((_, i) => i !== index) 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          {service ? 'Edit Service' : 'Add New Service'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg h-20 text-sm sm:text-base"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Starting Price</label>
              <input
                type="text"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
                placeholder="₦2,500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm sm:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Features</label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm sm:text-base"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="w-full sm:w-auto px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              + Add Feature
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            />
            <label htmlFor="active" className="text-sm font-medium">Service Active</label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm sm:text-base"
            >
              {service ? 'Update' : 'Add'} Service
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm sm:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}