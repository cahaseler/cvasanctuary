import { describe } from 'riteway/esm/riteway.js';
import { filterPets, sortPets, getAgeGroup, formatAge, extractFilterOptions } from '../src/assets/js/pet-filter.js';

const mockPets = [
  { id: 'SL-1', name: 'Fluffy', species: 'Cat', sex: 'Female', ageGroup: 'Adult', ageMonths: 36, size: 'Medium', breed: 'Domestic Shorthair', attributes: ['Good with Kids'], lastIntakeUnixTime: 1700000000 },
  { id: 'SL-2', name: 'Max', species: 'Dog', sex: 'Male', ageGroup: 'Young', ageMonths: 18, size: 'Large', breed: 'Labrador', attributes: ['House Trained'], lastIntakeUnixTime: 1705000000 },
  { id: 'SL-3', name: 'Whiskers', species: 'Cat', sex: 'Female', ageGroup: 'Senior', ageMonths: 144, size: 'Small', breed: 'Domestic Longhair', attributes: ['Good with Kids', 'Good with Cats'], lastIntakeUnixTime: 1690000000 },
  { id: 'SL-4', name: 'Buddy', species: 'Dog', sex: 'Male', ageGroup: 'Adult', ageMonths: 60, size: 'Large', breed: 'German Shepherd', attributes: ['House Trained', 'Good with Kids'], lastIntakeUnixTime: 1695000000 }
];

describe('filterPets()', async assert => {
  assert({
    given: 'no filters',
    should: 'return all pets',
    actual: filterPets(mockPets, {}).length,
    expected: 4
  });

  assert({
    given: 'species filter for Cat',
    should: 'return only cats',
    actual: filterPets(mockPets, { species: 'Cat' }).map(p => p.name),
    expected: ['Fluffy', 'Whiskers']
  });

  assert({
    given: 'sex filter for Male',
    should: 'return only males',
    actual: filterPets(mockPets, { sex: 'Male' }).map(p => p.name),
    expected: ['Max', 'Buddy']
  });

  assert({
    given: 'age group filter for Adult',
    should: 'return only adults',
    actual: filterPets(mockPets, { ageGroup: 'Adult' }).map(p => p.name),
    expected: ['Fluffy', 'Buddy']
  });

  assert({
    given: 'multiple filters (Dog + Male)',
    should: 'apply AND logic',
    actual: filterPets(mockPets, { species: 'Dog', sex: 'Male' }).map(p => p.name),
    expected: ['Max', 'Buddy']
  });

  assert({
    given: 'breed partial match',
    should: 'return pets with matching breed substring',
    actual: filterPets(mockPets, { breed: 'Domestic' }).map(p => p.name),
    expected: ['Fluffy', 'Whiskers']
  });

  assert({
    given: 'name search (case insensitive)',
    should: 'return pets matching name',
    actual: filterPets(mockPets, { name: 'max' }).map(p => p.name),
    expected: ['Max']
  });

  assert({
    given: 'size filter for Large',
    should: 'return only large pets',
    actual: filterPets(mockPets, { size: 'Large' }).map(p => p.name),
    expected: ['Max', 'Buddy']
  });

  assert({
    given: 'null input',
    should: 'return empty array',
    actual: filterPets(null, {}).length,
    expected: 0
  });
});

describe('sortPets()', async assert => {
  const sortablePets = [
    { id: '1', name: 'Zoe', lastIntakeUnixTime: 1705000000 },
    { id: '2', name: 'Alice', lastIntakeUnixTime: 1690000000 },
    { id: '3', name: 'Max', lastIntakeUnixTime: 1700000000 }
  ];

  assert({
    given: 'sort by longest-stay',
    should: 'return oldest intake first',
    actual: sortPets(sortablePets, 'longest-stay').map(p => p.name),
    expected: ['Alice', 'Max', 'Zoe']
  });

  assert({
    given: 'sort by shortest-stay',
    should: 'return newest intake first',
    actual: sortPets(sortablePets, 'shortest-stay').map(p => p.name),
    expected: ['Zoe', 'Max', 'Alice']
  });

  assert({
    given: 'sort by name-az',
    should: 'return alphabetical',
    actual: sortPets(sortablePets, 'name-az').map(p => p.name),
    expected: ['Alice', 'Max', 'Zoe']
  });

  assert({
    given: 'sort by name-za',
    should: 'return reverse alphabetical',
    actual: sortPets(sortablePets, 'name-za').map(p => p.name),
    expected: ['Zoe', 'Max', 'Alice']
  });

  assert({
    given: 'null input',
    should: 'return empty array',
    actual: sortPets(null, 'name-az').length,
    expected: 0
  });
});

describe('getAgeGroup()', async assert => {
  assert({
    given: 'a 3 month old cat',
    should: 'return Baby',
    actual: getAgeGroup(3, 'Cat'),
    expected: 'Baby'
  });

  assert({
    given: 'a 12 month old cat',
    should: 'return Young',
    actual: getAgeGroup(12, 'Cat'),
    expected: 'Young'
  });

  assert({
    given: 'a 60 month old cat',
    should: 'return Adult',
    actual: getAgeGroup(60, 'Cat'),
    expected: 'Adult'
  });

  assert({
    given: 'a 130 month old cat (10+ years)',
    should: 'return Senior',
    actual: getAgeGroup(130, 'Cat'),
    expected: 'Senior'
  });

  assert({
    given: 'a 3 month old dog',
    should: 'return Baby',
    actual: getAgeGroup(3, 'Dog'),
    expected: 'Baby'
  });

  assert({
    given: 'a 100 month old dog (8+ years)',
    should: 'return Senior',
    actual: getAgeGroup(100, 'Dog'),
    expected: 'Senior'
  });

  assert({
    given: 'a 50 month old dog',
    should: 'return Adult',
    actual: getAgeGroup(50, 'Dog'),
    expected: 'Adult'
  });
});

describe('formatAge()', async assert => {
  assert({
    given: '3 months',
    should: 'return "3 months"',
    actual: formatAge(3),
    expected: '3 months'
  });

  assert({
    given: '1 month',
    should: 'return singular "1 month"',
    actual: formatAge(1),
    expected: '1 month'
  });

  assert({
    given: '14 months',
    should: 'return "1 year, 2 months"',
    actual: formatAge(14),
    expected: '1 year, 2 months'
  });

  assert({
    given: '24 months',
    should: 'return "2 years" (no extra months)',
    actual: formatAge(24),
    expected: '2 years'
  });

  assert({
    given: '25 months',
    should: 'return "2 years, 1 month" (singular month)',
    actual: formatAge(25),
    expected: '2 years, 1 month'
  });

  assert({
    given: 'null',
    should: 'return "Unknown"',
    actual: formatAge(null),
    expected: 'Unknown'
  });

  assert({
    given: '0 months',
    should: 'return "Under 1 month"',
    actual: formatAge(0),
    expected: 'Under 1 month'
  });
});

describe('extractFilterOptions()', async assert => {
  const options = extractFilterOptions(mockPets);

  assert({
    given: 'pets with 2 cats and 2 dogs',
    should: 'count species correctly',
    actual: options.species,
    expected: { Cat: 2, Dog: 2 }
  });

  assert({
    given: 'pets with 2 Female and 2 Male',
    should: 'count sexes correctly',
    actual: options.sexes,
    expected: { Female: 2, Male: 2 }
  });

  assert({
    given: 'pets with various breeds',
    should: 'count breeds correctly',
    actual: options.breeds,
    expected: { 'Domestic Shorthair': 1, 'Labrador': 1, 'Domestic Longhair': 1, 'German Shepherd': 1 }
  });

  assert({
    given: 'pets with published attributes',
    should: 'count attributes correctly',
    actual: options.attributes,
    expected: { 'Good with Kids': 3, 'House Trained': 2, 'Good with Cats': 1 }
  });
});
