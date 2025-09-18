import { describe } from 'riteway/esm/riteway.js';
import { filterPets, sortPets } from '../src/assets/js/pet-filter.js';

describe('filterPets()', async assert => {
  const mockPets = [
    { id: 1, name: 'Fluffy', sex: 'Female', age: 'Adult', size: 'Small', primary_breed: 'Domestic Short Hair' },
    { id: 2, name: 'Max', sex: 'Male', age: 'Young', size: 'Large', primary_breed: 'Labrador' },
    { id: 3, name: 'Whiskers', sex: 'Female', age: 'Senior', size: 'Medium', primary_breed: 'Domestic Long Hair' },
    { id: 4, name: 'Buddy', sex: 'Male', age: 'Adult', size: 'Large', primary_breed: 'German Shepherd' }
  ];
  
  assert({
    given: 'no filters',
    should: 'return all pets',
    actual: filterPets(mockPets, {}).length,
    expected: 4
  });
  
  assert({
    given: 'sex filter for Female',
    should: 'return only female pets',
    actual: filterPets(mockPets, { sex: 'Female' }).map(p => p.name),
    expected: ['Fluffy', 'Whiskers']
  });
  
  assert({
    given: 'age filter for Adult',
    should: 'return only adult pets',
    actual: filterPets(mockPets, { age: 'Adult' }).map(p => p.name),
    expected: ['Fluffy', 'Buddy']
  });
  
  assert({
    given: 'multiple filters',
    should: 'apply all filters (AND logic)',
    actual: filterPets(mockPets, { sex: 'Male', size: 'Large' }).map(p => p.name),
    expected: ['Max', 'Buddy']
  });
  
  assert({
    given: 'breed filter with partial match',
    should: 'return pets with matching breed',
    actual: filterPets(mockPets, { breed: 'Domestic' }).map(p => p.name),
    expected: ['Fluffy', 'Whiskers']
  });
});

describe('sortPets()', async assert => {
  const mockPets = [
    { id: 2, name: 'Zoe', age: 'Young' },
    { id: 1, name: 'Alice', age: 'Adult' },
    { id: 3, name: 'Max', age: 'Senior' }
  ];

  assert({
    given: 'sort by name',
    should: 'return pets sorted alphabetically',
    actual: sortPets([...mockPets], 'name').map(p => p.name),
    expected: ['Alice', 'Max', 'Zoe']
  });

  assert({
    given: 'sort by newest (default)',
    should: 'return pets in original order',
    actual: sortPets([...mockPets], 'newest').map(p => p.name),
    expected: ['Zoe', 'Alice', 'Max']
  });

  assert({
    given: 'no sort specified',
    should: 'return pets in original order',
    actual: sortPets([...mockPets], null).map(p => p.name),
    expected: ['Zoe', 'Alice', 'Max']
  });
});

// TODO: createFilterUI() tests need DOM environment - moved to backlog