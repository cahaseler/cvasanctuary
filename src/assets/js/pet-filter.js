// Pet filtering and sorting utilities for Shelterluv data model.
// These functions are the canonical, testable source of truth.
// They are duplicated inline in adopt.njk (no JS build pipeline).

export function getAgeGroup(ageMonths, species) {
  if (species === 'Cat') {
    if (ageMonths < 6) return 'Baby';
    if (ageMonths < 24) return 'Young';
    if (ageMonths < 120) return 'Adult';
    return 'Senior';
  }
  if (ageMonths < 6) return 'Baby';
  if (ageMonths < 24) return 'Young';
  if (ageMonths < 96) return 'Adult';
  return 'Senior';
}

export function formatAge(ageMonths) {
  if (ageMonths === null || ageMonths === undefined) return 'Unknown';
  if (ageMonths < 1) return 'Under 1 month';
  if (ageMonths < 12) return ageMonths + (ageMonths === 1 ? ' month' : ' months');
  var years = Math.floor(ageMonths / 12);
  var months = ageMonths % 12;
  var result = years + (years === 1 ? ' year' : ' years');
  if (months > 0) result += ', ' + months + (months === 1 ? ' month' : ' months');
  return result;
}

export function filterPets(pets, filters) {
  if (!pets || !Array.isArray(pets)) return [];
  if (!filters || Object.keys(filters).length === 0) return pets;

  return pets.filter(function(pet) {
    if (filters.species && filters.species !== 'all') {
      if (pet.species !== filters.species) return false;
    }
    if (filters.sex && filters.sex !== 'all') {
      if (pet.sex !== filters.sex) return false;
    }
    if (filters.ageGroup && filters.ageGroup !== 'all') {
      if (pet.ageGroup !== filters.ageGroup) return false;
    }
    if (filters.size && filters.size !== 'all') {
      if (pet.size !== filters.size) return false;
    }
    if (filters.breed && filters.breed.trim()) {
      if ((pet.breed || '').toLowerCase().indexOf(filters.breed.trim().toLowerCase()) === -1) return false;
    }
    if (filters.name && filters.name.trim()) {
      if ((pet.name || '').toLowerCase().indexOf(filters.name.trim().toLowerCase()) === -1) return false;
    }
    return true;
  });
}

export function sortPets(pets, sortBy) {
  if (!pets || !Array.isArray(pets)) return [];
  var sorted = pets.slice();

  switch (sortBy) {
    case 'longest-stay':
      sorted.sort(function(a, b) { return a.lastIntakeUnixTime - b.lastIntakeUnixTime; });
      break;
    case 'shortest-stay':
      sorted.sort(function(a, b) { return b.lastIntakeUnixTime - a.lastIntakeUnixTime; });
      break;
    case 'name-az':
      sorted.sort(function(a, b) { return (a.name || '').localeCompare(b.name || ''); });
      break;
    case 'name-za':
      sorted.sort(function(a, b) { return (b.name || '').localeCompare(a.name || ''); });
      break;
    default:
      sorted.sort(function(a, b) { return a.lastIntakeUnixTime - b.lastIntakeUnixTime; });
  }

  return sorted;
}

export function extractFilterOptions(pets) {
  var options = {
    species: {},
    sexes: {},
    ageGroups: {},
    sizes: {},
    breeds: {},
    attributes: {}
  };

  pets.forEach(function(pet) {
    if (pet.species) options.species[pet.species] = (options.species[pet.species] || 0) + 1;
    if (pet.sex) options.sexes[pet.sex] = (options.sexes[pet.sex] || 0) + 1;
    if (pet.ageGroup) options.ageGroups[pet.ageGroup] = (options.ageGroups[pet.ageGroup] || 0) + 1;
    if (pet.size) options.sizes[pet.size] = (options.sizes[pet.size] || 0) + 1;
    if (pet.breed) options.breeds[pet.breed] = (options.breeds[pet.breed] || 0) + 1;
    (pet.attributes || []).forEach(function(attr) {
      options.attributes[attr] = (options.attributes[attr] || 0) + 1;
    });
  });

  return options;
}
