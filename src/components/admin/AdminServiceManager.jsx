import { useState, useEffect } from 'react';

export default function AdminServiceManager() {
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('admin_services');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : ['All', 'Home', 'Repairs', 'Moving', 'Outdoor'];
  });

  const [editingService, setEditingService] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const saveServices = (newServices) => {
    localStorage.setItem('admin_services', JSON.stringify(newServices));
    localStorage.setItem('admin_categories', JSON.stringify(categories));
    window.dispatchEvent(new Event('storage'));
    setServices(newServices);
  };

  const handleAddService = (serviceData) => {
    const newService = {
      ...serviceData,
      id: Date.now(),
    };
    saveServices([...services, newService]);
    setShowAddForm(false);
  };

  const handleUpdateService = (serviceData) => {
    const updated = services.map(s => s.id === editingService.id ? { ...serviceData, id: editingService.id } : s);
    saveServices(updated);
    setEditingService(null);
  };

  const handleDeleteService = (id) => {
    if (confirm('Delete this service?')) {
      saveServices(services.filter(s => s.id !== id));
    }
  };

  const toggleServiceStatus = (id) => {
    const updated = services.map(s => 
      s.id === id ? { ...s, active: !s.active } : s
    );
    saveServices(updated);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          + Add Service
        </button>
      </div>

      <div className="grid gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{service.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    service.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {service.active !== false ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {service.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{service.description}</p>
                <p className="font-semibold text-teal-600">{service.startingPrice}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    service.active !== false 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {service.active !== false ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setEditingService(service)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {service ? 'Edit Service' : 'Add New Service'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg h-20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
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
                className="w-full px-3 py-2 border rounded-lg"
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
              className="w-full px-3 py-2 border rounded-lg"
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
                  className="flex-1 px-3 py-2 border rounded-lg"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              {service ? 'Update' : 'Add'} Service
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}