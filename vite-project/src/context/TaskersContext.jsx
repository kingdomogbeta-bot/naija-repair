import { createContext, useContext, useState, useEffect } from 'react';
import { getTaskerFallbackPhoto, resolveTaskerPhoto } from '../utils/taskerPhoto';
import { buildApiUrl } from '../config/api';

const TaskersContext = createContext();

const STORAGE_KEY = 'naija_taskers';
const normalizeTaskerPhoto = (tasker) => ({
  ...tasker,
  photoUrl: resolveTaskerPhoto(tasker),
});

// Sample taskers data
const initialTaskers = [
  {
    id: '1',
    name: 'Chidi Okafor',
    email: 'chidi@gmail.com',
    phone: '+2348012345678',
    photoUrl: getTaskerFallbackPhoto('Chidi Okafor'),
    rating: 4.9,
    reviewCount: 127,
    completedTasks: 145,
    services: ['Handyman Services', 'Electrical Work', 'Painting Services'],
    hourlyRate: 2000,
    bio: 'Experienced handyman with 5+ years in home repairs and maintenance.',
    verified: true,
    joinedDate: '2023-01-15',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Ikeja',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Ikeja', 'Surulere', 'Yaba']
  },
  {
    id: '2',
    name: 'Amina Bello',
    email: 'amina@gmail.com',
    phone: '+2348023456789',
    photoUrl: getTaskerFallbackPhoto('Amina Bello'),
    rating: 4.8,
    reviewCount: 98,
    completedTasks: 112,
    services: ['Home Cleaning', 'Dry Cleaning & Laundry'],
    hourlyRate: 1500,
    bio: 'Professional cleaner specializing in deep cleaning and organization.',
    verified: true,
    joinedDate: '2023-03-20',
    availability: 'Available',
    state: 'FCT',
    lga: 'Gwagwalada',
    serviceStates: ['FCT'],
    serviceLGAs: ['Gwagwalada', 'Kuje', 'Bwari']
  },
  {
    id: '3',
    name: 'Tunde Adeyemi',
    email: 'tunde@gmail.com',
    phone: '+2348034567890',
    photoUrl: getTaskerFallbackPhoto('Tunde Adeyemi'),
    rating: 4.7,
    reviewCount: 85,
    completedTasks: 92,
    services: ['Moving & Delivery', 'Furniture Assembly'],
    hourlyRate: 2500,
    bio: 'Reliable mover and furniture assembly expert. Quick and careful.',
    verified: true,
    joinedDate: '2023-05-10',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Lekki',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Lekki', 'Ajah', 'Victoria Island']
  },
  {
    id: '4',
    name: 'Ngozi Eze',
    email: 'ngozi@gmail.com',
    phone: '+2348045678901',
    photoUrl: getTaskerFallbackPhoto('Ngozi Eze'),
    rating: 4.9,
    reviewCount: 156,
    completedTasks: 178,
    services: ['Home Cleaning', 'Dry Cleaning & Laundry'],
    hourlyRate: 2500,
    bio: 'Experienced cleaner specializing in deep cleaning and organization.',
    verified: true,
    joinedDate: '2022-11-05',
    availability: 'Available',
    state: 'Rivers',
    lga: 'Port Harcourt',
    serviceStates: ['Rivers'],
    serviceLGAs: ['Port Harcourt', 'Obio/Akpor']
  },
  {
    id: '5',
    name: 'Ibrahim Musa',
    email: 'ibrahim@gmail.com',
    phone: '+2348056789012',
    photoUrl: getTaskerFallbackPhoto('Ibrahim Musa'),
    rating: 5.0,
    reviewCount: 12,
    completedTasks: 15,
    services: ['Painting Services', 'Handyman Services'],
    hourlyRate: 3000,
    bio: 'Experienced painter with attention to detail. Quality work guaranteed!',
    verified: true,
    joinedDate: '2023-11-01',
    availability: 'Available',
    state: 'Kano',
    lga: 'Kano Municipal',
    serviceStates: ['Kano'],
    serviceLGAs: ['Kano Municipal', 'Nassarawa', 'Fagge']
  },
  {
    id: '6',
    name: 'Korede Adeyinka',
    email: 'korede@gmail.com',
    phone: '+2348067890123',
    photoUrl: getTaskerFallbackPhoto('Korede Adeyinka'),
    rating: 4.8,
    reviewCount: 94,
    completedTasks: 108,
    services: ['AC Installation & Repair'],
    hourlyRate: 3500,
    bio: 'Expert in air conditioning systems and refrigeration.',
    verified: true,
    joinedDate: '2022-09-12',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Surulere',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Surulere', 'Yaba', 'Mushin']
  },
  {
    id: '7',
    name: 'Faith Ekene',
    email: 'faith@gmail.com',
    phone: '+2348078901234',
    photoUrl: getTaskerFallbackPhoto('Faith Ekene'),
    rating: 4.6,
    reviewCount: 67,
    completedTasks: 79,
    services: ['Gardening & Landscaping'],
    hourlyRate: 1800,
    bio: 'Professional gardener creating beautiful outdoor spaces.',
    verified: true,
    joinedDate: '2023-02-14',
    availability: 'Available',
    state: 'Oyo',
    lga: 'Ibadan North',
    serviceStates: ['Oyo'],
    serviceLGAs: ['Ibadan North', 'Ibadan South-West']
  },
  {
    id: '8',
    name: 'Obinna Nwankwo',
    email: 'obinna@gmail.com',
    phone: '+2348089012345',
    photoUrl: getTaskerFallbackPhoto('Obinna Nwankwo'),
    rating: 4.9,
    reviewCount: 141,
    completedTasks: 167,
    services: ['Carpentry', 'Furniture Assembly'],
    hourlyRate: 2800,
    bio: 'Master carpenter with 10+ years of experience in custom woodwork.',
    verified: true,
    joinedDate: '2022-07-20',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Ikeja',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Ikeja', 'Agege', 'Alimosho']
  },
  {
    id: '9',
    name: 'Chiamaka Obi',
    email: 'chiamaka@gmail.com',
    phone: '+2348090123456',
    photoUrl: getTaskerFallbackPhoto('Chiamaka Obi'),
    rating: 4.7,
    reviewCount: 102,
    completedTasks: 121,
    services: ['Home Cleaning', 'Dry Cleaning & Laundry'],
    hourlyRate: 2500,
    bio: 'Professional cleaner with expertise in home organization and laundry services.',
    verified: true,
    joinedDate: '2023-04-05',
    availability: 'Available',
    state: 'FCT',
    lga: 'Municipal Area Council',
    serviceStates: ['FCT'],
    serviceLGAs: ['Municipal Area Council', 'Gwagwalada']
  },
  {
    id: '10',
    name: 'Uthman Danjuma',
    email: 'uthman@gmail.com',
    phone: '+2348091234567',
    photoUrl: getTaskerFallbackPhoto('Uthman Danjuma'),
    rating: 4.8,
    reviewCount: 88,
    completedTasks: 104,
    services: ['Car Wash & Detailing'],
    hourlyRate: 3000,
    bio: 'Professional auto detailer keeping your vehicle spotless.',
    verified: true,
    joinedDate: '2023-05-18',
    availability: 'Available',
    state: 'Kaduna',
    lga: 'Kaduna North',
    serviceStates: ['Kaduna'],
    serviceLGAs: ['Kaduna North', 'Kaduna South']
  },
  {
    id: '11',
    name: 'Titi Oluwaseun',
    email: 'titi@gmail.com',
    phone: '+2348092345678',
    photoUrl: getTaskerFallbackPhoto('Titi Oluwaseun'),
    rating: 4.9,
    reviewCount: 135,
    completedTasks: 158,
    services: ['Pest Control'],
    hourlyRate: 4000,
    bio: 'Certified pest control specialist with eco-friendly solutions.',
    verified: true,
    joinedDate: '2022-12-10',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Lagos Island',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Lagos Island', 'Victoria Island', 'Ikoyi']
  },
  {
    id: '12',
    name: 'Emeka Okonkwo',
    email: 'emeka@gmail.com',
    phone: '+2348093456789',
    photoUrl: getTaskerFallbackPhoto('Emeka Okonkwo'),
    rating: 4.7,
    reviewCount: 76,
    completedTasks: 89,
    services: ['Appliance Repair', 'Electrical Work'],
    hourlyRate: 3500,
    bio: 'Appliance repair specialist fixing all household electronics.',
    verified: true,
    joinedDate: '2023-06-22',
    availability: 'Available',
    state: 'Rivers',
    lga: 'Port Harcourt',
    serviceStates: ['Rivers'],
    serviceLGAs: ['Port Harcourt', 'Eleme']
  },
  {
    id: '13',
    name: 'Blessing Adamu',
    email: 'blessing@gmail.com',
    phone: '+2348094567890',
    photoUrl: getTaskerFallbackPhoto('Blessing Adamu'),
    rating: 4.9,
    reviewCount: 143,
    completedTasks: 165,
    services: ['Catering Services'],
    hourlyRate: 8000,
    bio: 'Professional caterer specializing in Nigerian and continental cuisine.',
    verified: true,
    joinedDate: '2022-08-15',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Lekki',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Lekki', 'Ajah', 'Ikoyi']
  },
  {
    id: '14',
    name: 'Yusuf Abdullahi',
    email: 'yusuf@gmail.com',
    phone: '+2348095678901',
    photoUrl: getTaskerFallbackPhoto('Yusuf Abdullahi'),
    rating: 4.8,
    reviewCount: 91,
    completedTasks: 107,
    services: ['Plumbing Services', 'Handyman Services'],
    hourlyRate: 3500,
    bio: 'Reliable plumber with quick response time for emergencies.',
    verified: true,
    joinedDate: '2023-07-10',
    availability: 'Available',
    state: 'Kano',
    lga: 'Kano Municipal',
    serviceStates: ['Kano'],
    serviceLGAs: ['Kano Municipal', 'Gwale']
  },
  {
    id: '15',
    name: 'Chioma Nnamdi',
    email: 'chioma@gmail.com',
    phone: '+2348096789012',
    photoUrl: getTaskerFallbackPhoto('Chioma Nnamdi'),
    rating: 5.0,
    reviewCount: 45,
    completedTasks: 48,
    services: ['Home Cleaning', 'Dry Cleaning & Laundry'],
    hourlyRate: 2500,
    bio: 'Meticulous cleaner with eco-friendly cleaning products.',
    verified: true,
    joinedDate: '2023-09-05',
    availability: 'Available',
    state: 'Oyo',
    lga: 'Ibadan North',
    serviceStates: ['Oyo'],
    serviceLGAs: ['Ibadan North', 'Ibadan South-East']
  },
  {
    id: '16',
    name: 'Ahmed Balogun',
    email: 'ahmed@gmail.com',
    phone: '+2348097890123',
    photoUrl: getTaskerFallbackPhoto('Ahmed Balogun'),
    rating: 4.6,
    reviewCount: 54,
    completedTasks: 63,
    services: ['Moving & Delivery', 'Furniture Assembly'],
    hourlyRate: 4000,
    bio: 'Experienced mover handling delicate items with care.',
    verified: true,
    joinedDate: '2023-08-20',
    availability: 'Available',
    state: 'FCT',
    lga: 'Bwari',
    serviceStates: ['FCT'],
    serviceLGAs: ['Bwari', 'Kuje']
  },
  {
    id: '17',
    name: 'Funmi Ajayi',
    email: 'funmi@gmail.com',
    phone: '+2348098901234',
    photoUrl: getTaskerFallbackPhoto('Funmi Ajayi'),
    rating: 4.9,
    reviewCount: 118,
    completedTasks: 134,
    services: ['Home Cleaning', 'Dry Cleaning & Laundry'],
    hourlyRate: 2500,
    bio: 'Professional cleaner with attention to detail and organization.',
    verified: true,
    joinedDate: '2023-01-30',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Ikeja',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Ikeja', 'Ojodu', 'Agege']
  },
  {
    id: '18',
    name: 'Segun Oladipo',
    email: 'segun@gmail.com',
    phone: '+2348099012345',
    photoUrl: getTaskerFallbackPhoto('Segun Oladipo'),
    rating: 4.7,
    reviewCount: 82,
    completedTasks: 96,
    services: ['Carpentry', 'Handyman Services', 'Painting Services'],
    hourlyRate: 4500,
    bio: 'Skilled carpenter and painter creating custom furniture and beautiful finishes.',
    verified: true,
    joinedDate: '2023-04-12',
    availability: 'Available',
    state: 'Kaduna',
    lga: 'Kaduna South',
    serviceStates: ['Kaduna'],
    serviceLGAs: ['Kaduna South', 'Kaduna North']
  },
  {
    id: '19',
    name: 'Kemi Olaniyan',
    email: 'kemi@gmail.com',
    phone: '+2348100123456',
    photoUrl: getTaskerFallbackPhoto('Kemi Olaniyan'),
    rating: 4.8,
    reviewCount: 99,
    completedTasks: 115,
    services: ['Gardening & Landscaping'],
    hourlyRate: 3000,
    bio: 'Landscape designer with passion for sustainable gardens.',
    verified: true,
    joinedDate: '2023-03-08',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Lekki',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Lekki', 'Ajah']
  },
  {
    id: '20',
    name: 'Bola Adebayo',
    email: 'bola@gmail.com',
    phone: '+2348101234567',
    photoUrl: getTaskerFallbackPhoto('Bola Adebayo'),
    rating: 4.9,
    reviewCount: 167,
    completedTasks: 189,
    services: ['AC Installation & Repair', 'Appliance Repair'],
    hourlyRate: 5500,
    bio: 'HVAC specialist with 12 years experience in cooling systems.',
    verified: true,
    joinedDate: '2022-06-18',
    availability: 'Available',
    state: 'Rivers',
    lga: 'Port Harcourt',
    serviceStates: ['Rivers'],
    serviceLGAs: ['Port Harcourt', 'Obio/Akpor']
  },
  {
    id: '21',
    name: 'Chinedu Okoro',
    email: 'chinedu@gmail.com',
    phone: '+2348102345678',
    photoUrl: getTaskerFallbackPhoto('Chinedu Okoro'),
    rating: 4.8,
    reviewCount: 95,
    completedTasks: 110,
    services: ['Security Services'],
    hourlyRate: 5000,
    bio: 'Professional security expert providing comprehensive home and business protection.',
    verified: true,
    joinedDate: '2023-02-20',
    availability: 'Available',
    state: 'Lagos',
    lga: 'Ikeja',
    serviceStates: ['Lagos'],
    serviceLGAs: ['Ikeja', 'Maryland', 'Ojota']
  },
];

export function TaskersProvider({ children }) {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskers();
  }, []);

  const loadTaskers = async () => {
    try {
      const localTaskers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      console.log(`Local storage has ${localTaskers.length} taskers`);
      
      try {
        const timestamp = new Date().getTime();
        // Use includeUnapproved=true to get ALL taskers for the context
        const endpoint = buildApiUrl('/taskers/all?includeUnapproved=true');
        
        console.log('Fetching ALL taskers from backend (including unapproved)...');
        const response = await fetch(`${endpoint}&t=${timestamp}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const backendTaskers = await response.json();
          console.log(`Loaded ${backendTaskers.length} taskers from backend:`);
          console.log('Backend taskers:', backendTaskers.map(t => ({ id: t._id, name: t.name, email: t.email, approved: t.approved, suspended: t.suspended })));
          
          const processedBackendTaskers = backendTaskers.map(t => ({ ...t, id: t._id, isBackendTasker: true }));
          const filteredLocalTaskers = localTaskers.filter(lt => 
            !backendTaskers.find(bt => bt.email === lt.email) &&
            !initialTaskers.find(it => it.email === lt.email)
          );
          
          const mergedTaskers = [
            ...initialTaskers,
            ...processedBackendTaskers,
            ...filteredLocalTaskers
          ];
          
          console.log(`Total merged taskers: ${mergedTaskers.length} (${initialTaskers.length} virtual + ${backendTaskers.length} backend + ${filteredLocalTaskers.length} local)`);
          console.log('All merged taskers:', mergedTaskers.map(t => ({ id: t.id, name: t.name, isBackend: !!t.isBackendTasker, approved: t.approved, suspended: t.suspended })));
          setTaskers(mergedTaskers.map(normalizeTaskerPhoto));
        } else {
          console.log('Backend not available, using local data');
          const mergedTaskers = [...initialTaskers, ...localTaskers];
          setTaskers(mergedTaskers.map(normalizeTaskerPhoto));
        }
      } catch (error) {
        console.error('Backend fetch error:', error);
        const mergedTaskers = localTaskers.length > 0 ? [...initialTaskers, ...localTaskers] : initialTaskers;
        setTaskers(mergedTaskers.map(normalizeTaskerPhoto));
      }
    } catch (e) {
      console.error('Load taskers error:', e);
      setTaskers(initialTaskers.map(normalizeTaskerPhoto));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskers));
    } catch (e) {
      console.warn('Failed to save taskers', e);
    }
  }, [taskers]);

  const addTasker = (taskerData) => {
    const newTasker = {
      id: Date.now().toString(),
      ...taskerData,
      photoUrl: resolveTaskerPhoto(taskerData),
      rating: 5.0,
      reviewCount: 0,
      completedTasks: 0,
      verified: false,
      joinedDate: new Date().toISOString().split('T')[0],
      availability: 'Available',
      isNew: true,
    };
    setTaskers(prev => [...prev, newTasker]);
    return newTasker;
  };

  const updateTasker = async (emailOrId, updates) => {
    try {
      // Try to update in backend if it's a real tasker (has _id)
      const tasker = taskers.find(t => t.id === emailOrId || t.email === emailOrId);
      if (tasker && tasker._id) {
        const token = localStorage.getItem('naija_token');
        if (token) {
          await fetch(buildApiUrl('/taskers/profile'), {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
          });
        }
      }
    } catch (error) {
      console.error('Failed to update tasker in backend:', error);
    }
    
    // Always update local state (for both real and virtual taskers)
    setTaskers(prev => prev.map((tasker) => {
      if (tasker.id !== emailOrId && tasker.email !== emailOrId) return tasker;
      return normalizeTaskerPhoto({ ...tasker, ...updates });
    }));
  };

  const getTopRatedTaskers = (limit = 10) => {
    return [...taskers]
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, limit);
  };

  const getNewTaskers = (limit = 10) => {
    return [...taskers]
      .filter(t => t.isNew || new Date(t.joinedDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
      .slice(0, limit);
  };

  const getApprovedTaskers = () => {
    return taskers.filter(t => {
      // Virtual taskers are always considered approved
      if (!t._id && !t.isBackendTasker) return true;
      // Backend taskers: show all active, non-suspended taskers (since we auto-approve)
      return t.isActive !== false && !t.suspended;
    });
  };

  const getAllTaskers = () => {
    return taskers;
  };

  const getTaskersByService = (service, approvedOnly = true) => {
    const taskersToFilter = approvedOnly ? getApprovedTaskers() : taskers;
    return taskersToFilter.filter(t => t.services.includes(service));
  };

  const refreshTaskers = async () => {
    await loadTaskers();
  };

  return (
    <TaskersContext.Provider value={{
      taskers,
      loading,
      addTasker,
      updateTasker,
      getTopRatedTaskers,
      getNewTaskers,
      getTaskersByService,
      getApprovedTaskers,
      getAllTaskers,
      refreshTaskers,
    }}>
      {children}
    </TaskersContext.Provider>
  );
}

export function useTaskers() {
  const ctx = useContext(TaskersContext);
  if (!ctx) {
    throw new Error('useTaskers must be used within TaskersProvider');
  }
  return ctx;
}
