import { createContext, useContext, useState, useEffect } from 'react';

const TaskersContext = createContext();

const STORAGE_KEY = 'naija_taskers';

// Sample taskers data
const initialTaskers = [
  {
    id: '1',
    name: 'Chidi Okafor',
    email: 'chidi@gmail.com',
    phone: '+2348012345678',
    photoUrl: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&w=200&h=200&fit=crop',
    rating: 4.9,
    reviewCount: 127,
    completedTasks: 145,
    services: ['Handyman', 'Repairs', 'Painting'],
    hourlyRate: 3500,
    bio: 'Experienced handyman with 5+ years in home repairs and maintenance.',
    verified: true,
    joinedDate: '2023-01-15',
    availability: 'Available',
  },
  {
    id: '2',
    name: 'Amina Bello',
    email: 'amina@gmail.com',
    phone: '+2348023456789',
    photoUrl: 'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&w=200&h=200&fit=crop',
    rating: 4.8,
    reviewCount: 98,
    completedTasks: 112,
    services: ['Cleaning', 'Home Organization'],
    hourlyRate: 2500,
    bio: 'Professional cleaner specializing in deep cleaning and organization.',
    verified: true,
    joinedDate: '2023-03-20',
    availability: 'Available',
  },
  {
    id: '3',
    name: 'Tunde Adeyemi',
    email: 'tunde@gmail.com',
    phone: '+2348034567890',
    photoUrl: 'https://images.pexels.com/photos/897817/pexels-photo-897817.jpeg?auto=compress&w=200&h=200&fit=crop',
    rating: 4.7,
    reviewCount: 85,
    completedTasks: 92,
    services: ['Moving', 'Furniture Assembly'],
    hourlyRate: 4000,
    bio: 'Reliable mover and furniture assembly expert. Quick and careful.',
    verified: true,
    joinedDate: '2023-05-10',
    availability: 'Available',
  },
  {
    id: '4',
    name: 'Ngozi Eze',
    email: 'ngozi@gmail.com',
    phone: '+2348045678901',
    photoUrl: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&w=200&h=200&fit=crop',
    rating: 4.9,
    reviewCount: 156,
    completedTasks: 178,
    services: ['Electrical', 'Plumbing'],
    hourlyRate: 5000,
    bio: 'Licensed electrician and plumber with 8 years experience.',
    verified: true,
    joinedDate: '2022-11-05',
    availability: 'Available',
  },
  {
    id: '5',
    name: 'Ibrahim Musa',
    email: 'ibrahim@gmail.com',
    phone: '+2348056789012',
    photoUrl: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&w=200&h=200&fit=crop',
    rating: 5.0,
    reviewCount: 12,
    completedTasks: 15,
    services: ['Painting', 'Handyman'],
    hourlyRate: 3000,
    bio: 'New to the platform but experienced painter. Quality work guaranteed!',
    verified: false,
    joinedDate: new Date().toISOString().split('T')[0],
    availability: 'Available',
    isNew: true,
  },
];

export function TaskersProvider({ children }) {
  const [taskers, setTaskers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : initialTaskers;
    } catch (e) {
      return initialTaskers;
    }
  });

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

  const updateTasker = (emailOrId, updates) => {
    setTaskers(prev => prev.map(t => (t.id === emailOrId || t.email === emailOrId) ? { ...t, ...updates } : t));
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

  const getTaskersByService = (service) => {
    return taskers.filter(t => t.services.includes(service));
  };

  return (
    <TaskersContext.Provider value={{
      taskers,
      addTasker,
      updateTasker,
      getTopRatedTaskers,
      getNewTaskers,
      getTaskersByService,
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
