import { faker } from '@faker-js/faker';
import type { Ad, User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const carMakes = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda'];
const carModels: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Wagon R', 'Alto', 'Dzire'],
  'Hyundai': ['i20', 'Creta', 'Venue', 'Verna', 'Grand i10'],
  'Tata': ['Nexon', 'Punch', 'Harrier', 'Safari', 'Altroz'],
  'Mahindra': ['Thar', 'XUV700', 'Scorpio', 'Bolero'],
  'Kia': ['Seltos', 'Sonet', 'Carens'],
  'Toyota': ['Innova Crysta', 'Fortuner', 'Glanza'],
  'Honda': ['City', 'Amaze'],
};

export const createMockUser = (): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  phone: faker.phone.number(),
  email: faker.internet.email(),
  role: 'dealer',
  isPro: faker.datatype.boolean(),
  proExpiresAt: faker.date.future(),
  createdAt: faker.date.past(),
});

export const MOCK_USERS: User[] = Array.from({ length: 10 }, createMockUser);

export const createMockAd = (dealer: User): Ad => {
  const make = faker.helpers.arrayElement(carMakes);
  const model = faker.helpers.arrayElement(carModels[make]);
  const year = faker.number.int({ min: 2010, max: 2024 });
  const title = `${year} ${make} ${model}`;
  
  const randomImageCount = faker.number.int({ min: 1, max: 5 });
  const images = faker.helpers.shuffle(PlaceHolderImages.filter(img => img.id.startsWith('car-')))
                     .slice(0, randomImageCount)
                     .map(img => img.imageUrl);

  return {
    id: faker.string.uuid(),
    dealerId: dealer.id,
    title,
    make,
    model,
    year,
    kmDriven: faker.number.int({ min: 5000, max: 150000 }),
    fuelType: faker.helpers.arrayElement(['Petrol', 'Diesel', 'Electric']),
    transmission: faker.helpers.arrayElement(['Automatic', 'Manual']),
    price: faker.number.int({ min: 100000, max: 3000000 }),
    description: faker.lorem.paragraphs(2),
    location: `${faker.location.city()}, ${faker.location.stateAbbr()}`,
    images: images,
    status: faker.helpers.arrayElement(['active', 'sold']),
    createdAt: faker.date.past(),
    soldAt: null,
    removedAt: null,
    removalPaid: false,
    removalPaymentId: null,
    dealer: dealer
  };
};

export const MOCK_ADS: Ad[] = MOCK_USERS.flatMap(user => 
  Array.from({ length: faker.number.int({min: 2, max: 5}) }, () => createMockAd(user))
);
