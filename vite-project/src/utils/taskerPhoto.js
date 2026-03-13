// Map tasker names to their photo filenames
const TASKER_PHOTO_MAP = {
  'chidi okafor': '/taskers/chidi-okafor.jpg',
  'amina bello': '/taskers/amina-bello.jpg',
  'tunde adeyemi': '/taskers/tunde-adeyemi.jpg',
  'ngozi eze': '/taskers/ngozi-eze.jpg',
  'ibrahim musa': '/taskers/ibrahim-musa.jpg',
  'korede adeyinka': '/taskers/korede-adeyinka.jpg',
  'faith ekene': '/taskers/faith-ekene.jpg',
  'obinna nwankwo': '/taskers/obinna-nwankwo.jpg',
  'chiamaka obi': '/taskers/chiamaka-obi.jpg',
  'uthman danjuma': '/taskers/uthman-danjuma.jpg',
  'titi oluwaseun': '/taskers/titi-oluwaseun.jpg',
  'emeka okonkwo': '/taskers/emeka-okonkwo.jpg',
  'blessing adamu': '/taskers/blessing-adamu.jpg',
  'yusuf abdullahi': '/taskers/yusuf-abdullahi.jpg',
  'chioma nnamdi': '/taskers/chioma-nnamdi.jpg',
  'ahmed balogun': '/taskers/ahmed-balogun.jpg',
  'funmi ajayi': '/taskers/funmi-ajayi.jpg',
  'segun oladipo': '/taskers/segun-oladipo.jpg',
  'kemi olaniyan': '/taskers/kemi-olaniyan.jpg',
  'bola adebayo': '/taskers/bola-adebayo.jpg',
  'chinedu okoro': '/taskers/chinedu-okoro.jpg',
};

const MALE_AFRICAN_PHOTOS = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/men/13.jpg',
  'https://randomuser.me/api/portraits/men/15.jpg',
];

const FEMALE_AFRICAN_PHOTOS = [
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/14.jpg',
  'https://randomuser.me/api/portraits/women/16.jpg',
];

const ALL_AFRICAN_PHOTOS = [...MALE_AFRICAN_PHOTOS, ...FEMALE_AFRICAN_PHOTOS];
const PHOTO_MAP_KEY = 'naija_tasker_photo_map_v2';

const FEMALE_FIRST_NAMES = new Set([
  'amina', 'ngozi', 'faith', 'chiamaka', 'titi', 'aisha', 'zainab', 'bisi', 'funke',
  'chioma', 'kemi', 'folake', 'remi', 'shade', 'bola', 'mariam', 'halima', 'blessing',
  'grace', 'esther', 'joy', 'loveth', 'mercy', 'ifeoma', 'ada', 'adaeze', 'tosin',
]);

const MALE_FIRST_NAMES = new Set([
  'chidi', 'tunde', 'ibrahim', 'korede', 'obinna', 'uthman', 'john', 'james', 'emeka',
  'kunle', 'oluwaseun', 'musa', 'mohammed', 'ahmed', 'adamu', 'sunday', 'monday',
  'samuel', 'daniel', 'victor', 'prince', 'femi', 'segun', 'wale', 'yakubu', 'idris',
]);

const IMAGE_SOURCE_PATTERN = /^(https?:\/\/|data:image\/|blob:|\/)/i;

const hashName = (value = '') => value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
const getFirstName = (value = '') => value.trim().split(/\s+/)[0]?.toLowerCase() || '';
const normalizeNameKey = (value = '') => value.trim().toLowerCase().replace(/\s+/g, ' ');

const loadPhotoMap = () => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(PHOTO_MAP_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
};

const savePhotoMap = (map) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PHOTO_MAP_KEY, JSON.stringify(map));
  } catch (error) {
    // Ignore storage write errors and continue with deterministic fallback.
  }
};

const getPoolForGender = (gender = 'unknown') => {
  if (gender === 'female') return FEMALE_AFRICAN_PHOTOS;
  if (gender === 'male') return MALE_AFRICAN_PHOTOS;
  return ALL_AFRICAN_PHOTOS;
};

const inferGender = (tasker = {}) => {
  const genderValue = (tasker.gender || tasker.sex || '').toString().toLowerCase().trim();
  if (genderValue === 'female' || genderValue === 'woman' || genderValue === 'f') return 'female';
  if (genderValue === 'male' || genderValue === 'man' || genderValue === 'm') return 'male';

  const name = tasker.name || tasker.fullName || '';
  const firstName = getFirstName(name);
  if (FEMALE_FIRST_NAMES.has(firstName)) return 'female';
  if (MALE_FIRST_NAMES.has(firstName)) return 'male';
  return 'unknown';
};

const isPhotoInPool = (photo, pool) => pool.includes(photo);
const isLegacyFallbackUrl = (url = '') => false; // Allow all randomuser.me URLs

const shouldUseCandidatePhoto = (tasker, photoUrl) => {
  if (!isValidImageSource(photoUrl)) return false;
  if (isLegacyFallbackUrl(photoUrl)) return false;
  if (!isPhotoInPool(photoUrl, ALL_AFRICAN_PHOTOS)) return true;

  const gender = inferGender(tasker);
  const allowedPool = getPoolForGender(gender);
  return isPhotoInPool(photoUrl, allowedPool);
};

export const isValidImageSource = (value = '') => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && IMAGE_SOURCE_PATTERN.test(trimmed);
};

export const getTaskerFallbackPhoto = (nameOrTasker = '') => {
  const tasker = typeof nameOrTasker === 'string'
    ? { name: nameOrTasker }
    : (nameOrTasker || {});
  const name = tasker.name || tasker.fullName || '';
  const normalizedName = normalizeNameKey(name);
  
  // Check if we have a local photo for this tasker
  if (TASKER_PHOTO_MAP[normalizedName]) {
    return TASKER_PHOTO_MAP[normalizedName];
  }
  
  const gender = inferGender(tasker);
  const targetPool = getPoolForGender(gender);
  const map = loadPhotoMap();
  const savedPhoto = map[normalizedName];

  if (
    normalizedName &&
    isValidImageSource(savedPhoto) &&
    isPhotoInPool(savedPhoto, targetPool)
  ) {
    return savedPhoto;
  }

  const selectedPhoto = targetPool[hashName(normalizedName || name) % targetPool.length];
  if (normalizedName) {
    map[normalizedName] = selectedPhoto;
    savePhotoMap(map);
  }
  return selectedPhoto;
};

export const resolveTaskerPhoto = (tasker = {}) => {
  const candidates = [tasker.photoUrl, tasker.photo, tasker.avatar];
  const validCandidate = candidates.find((photoUrl) => shouldUseCandidatePhoto(tasker, photoUrl));
  return validCandidate || getTaskerFallbackPhoto(tasker);
};

export const setTaskerFallbackOnError = (event, nameOrTasker = '') => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = getTaskerFallbackPhoto(nameOrTasker);
};
