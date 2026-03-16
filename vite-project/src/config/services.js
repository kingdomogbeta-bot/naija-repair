import { getAllServices } from '../services/api';

const DEFAULT_SERVICES = [
  { id: 1, name: 'Home Cleaning', description: 'Professional deep cleaning services for homes and offices. Our experts ensure every corner sparkles.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop', features: ['Deep Cleaning', 'Regular Maintenance', 'Move-in/Move-out', 'Office Cleaning'], startingPrice: '₦2,500', category: 'Home', active: true },
  { id: 2, name: 'Handyman Services', description: 'Expert repairs and maintenance for all your home improvement needs. From minor fixes to major projects.', image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop', features: ['General Repairs', 'Door & Window Fixes', 'Wall Repairs', 'Minor Installations'], startingPrice: '₦3,000', category: 'Repairs', active: true },
  { id: 3, name: 'Electrical Work', description: 'Licensed electricians for safe and reliable electrical installations, repairs, and maintenance.', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop', features: ['Wiring & Rewiring', 'Light Installations', 'Circuit Repairs', 'Safety Inspections'], startingPrice: '₦4,000', category: 'Repairs', active: true },
  { id: 4, name: 'Plumbing Services', description: 'Fast and reliable plumbing solutions for leaks, installations, and emergency repairs.', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop', features: ['Leak Repairs', 'Pipe Installation', 'Drain Cleaning', 'Water Heater Service'], startingPrice: '₦3,500', category: 'Repairs', active: true },
  { id: 5, name: 'Painting Services', description: 'Transform your space with professional interior and exterior painting services.', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop', features: ['Interior Painting', 'Exterior Painting', 'Color Consultation', 'Wall Preparation'], startingPrice: '₦2,800', category: 'Home', active: true },
  { id: 6, name: 'Moving', description: 'Reliable moving and delivery services with careful handling of your belongings.', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop', features: ['Local Moving', 'Packing Services', 'Furniture Delivery', 'Heavy Lifting'], startingPrice: '₦5,000', category: 'Moving', active: true },
  { id: 7, name: 'Furniture Assembly', description: 'Quick and efficient furniture assembly for all types of flat-pack furniture.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop', features: ['IKEA Assembly', 'Office Furniture', 'Bed Frames', 'Shelving Units'], startingPrice: '₦2,000', category: 'Home', active: true },
  { id: 8, name: 'Gardening & Landscaping', description: 'Create and maintain beautiful outdoor spaces with our gardening experts.', image: 'https://plus.unsplash.com/premium_photo-1661423948734-f46aa74284e0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8R2FyZGVuaW5nJTIwJTI2JTIwTGFuZHNjYXBpbmd8ZW58MHx8MHx8fDA%3D', features: ['Lawn Maintenance', 'Garden Design', 'Tree Trimming', 'Irrigation Setup'], startingPrice: '₦3,000', category: 'Outdoor', active: true },
  { id: 9, name: 'Carpentry', description: 'Custom woodwork and carpentry services for furniture, cabinets, and more.', image: 'https://images.unsplash.com/photo-1645651964715-d200ce0939cc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FycGVudHJ5fGVufDB8fDB8fHww', features: ['Custom Furniture', 'Cabinet Making', 'Door Installation', 'Wood Repairs'], startingPrice: '₦4,500', category: 'Repairs', active: true },
  { id: 10, name: 'AC Installation & Repair', description: 'Professional air conditioning installation, maintenance, and repair services.', image: 'https://plus.unsplash.com/premium_photo-1682126009570-3fe2399162f7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YWlyJTIwY29uZGl0aW9uZXJ8ZW58MHx8MHx8fDA%3D', features: ['AC Installation', 'Maintenance', 'Gas Refilling', 'Emergency Repairs'], startingPrice: '₦5,500', category: 'Repairs', active: true },
  { id: 11, name: 'Pest Control', description: 'Effective pest control solutions to keep your home safe and pest-free.', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop', features: ['Fumigation', 'Termite Control', 'Rodent Removal', 'Preventive Treatment'], startingPrice: '₦6,000', category: 'Home', active: true },
  { id: 12, name: 'Appliance Repair', description: 'Expert repair services for all household appliances and electronics.', image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop', features: ['Refrigerator Repair', 'Washing Machine', 'Microwave', 'TV Repair'], startingPrice: '₦3,500', category: 'Repairs', active: true },
  { id: 13, name: 'Dry Cleaning & Laundry', description: 'Professional dry cleaning and laundry services with pickup and delivery options.', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&h=600&fit=crop', features: ['Ironing Only - ₦300/item', 'Wash & Iron - ₦500/item', 'Pickup & Delivery', 'Same Day Service'], startingPrice: '₦300', category: 'Home', specialService: 'dry-cleaning', active: true },
  { id: 14, name: 'Car Wash & Detailing', description: 'Complete car washing and detailing services to keep your vehicle spotless.', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&h=600&fit=crop', features: ['Exterior Wash', 'Interior Cleaning', 'Waxing & Polish', 'Engine Cleaning'], startingPrice: '₦3,000', category: 'Outdoor', active: true },
  { id: 15, name: 'Catering Services', description: 'Professional catering for events, parties, and special occasions.', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop', features: ['Event Catering', 'Party Planning', 'Custom Menus', 'Professional Staff'], startingPrice: '₦15,000', category: 'Home', active: true },
  { id: 16, name: 'Security Services', description: 'Reliable security guards and surveillance systems for homes and businesses.', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&h=600&fit=crop', features: ['Security Guards', 'CCTV Installation', 'Alarm Systems', '24/7 Monitoring'], startingPrice: '₦8,000', category: 'Home', active: true }
];

let cachedServices = null;

export const getServices = async () => {
  try {
    const response = await getAllServices();
    if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
      cachedServices = response.data.filter(s => s.active !== false).map(s => ({ ...s, id: s._id || s.id }));
      return cachedServices;
    }
  } catch (error) {
    console.error('Failed to fetch services from backend:', error);
  }
  return DEFAULT_SERVICES;
};

export const SERVICES = cachedServices || DEFAULT_SERVICES;

export const getServiceCategories = () => {
  return ['All', 'Home', 'Repairs', 'Moving', 'Outdoor'];
};

export const SERVICE_CATEGORIES = getServiceCategories();
export const SERVICE_NAMES = DEFAULT_SERVICES.map(s => s.name);
