import { faker } from '@faker-js/faker';
import type { Ad, User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const carMakes = ['Maruti Suzuki', 'Hyundai', 'Tata'];
const carModels: { [key: string]: string[] } = {
  'Maruti Suzuki': ['Swift', 'Baleno'],
  'Hyundai': ['i20', 'Creta'],
  'Tata': ['Nexon', 'Punch'],
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

export const MOCK_USERS: User[] = Array.from({ length: 2 }, createMockUser);

export const createMockAd = (dealer: User): Ad => {
  const make = faker.helpers.arrayElement(carMakes);
  const model = faker.helpers.arrayElement(carModels[make]);
  const year = faker.number.int({ min: 2018, max: 2024 });
  const title = `${year} ${make} ${model}`;
  
  const randomImageCount = faker.number.int({ min: 1, max: 3 });
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
    kmDriven: faker.number.int({ min: 15000, max: 80000 }),
    fuelType: faker.helpers.arrayElement(['Petrol', 'Diesel']),
    transmission: faker.helpers.arrayElement(['Automatic', 'Manual']),
    price: faker.number.int({ min: 300000, max: 1500000 }),
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
  Array.from({ length: faker.number.int({min: 1, max: 2}) }, () => createMockAd(user))
);
