import { faker } from '@faker-js/faker'

export const users = Array.from({ length: 20 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.numeric(2),
    firstName,
    lastName,
    username: faker.internet
      .username({ firstName, lastName })
      .toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([
      'active',
      'inactive',
      'invited',
      'suspended',
    ]),
    approved: faker.helpers.arrayElement([
      'Approved',
      'Rejected'
    ]),
    role: faker.helpers.arrayElement([
      'superadmin',
      'groupadmin',
      'user'
    ]),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    groups: [],
    projects: []
  }
})