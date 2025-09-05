export function filterPets(pets, filters) {
  if (!pets || !Array.isArray(pets)) return [];
  if (!filters || Object.keys(filters).length === 0) return pets;
  
  return pets.filter(pet => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value || value === 'all') continue;
      
      if (key === 'breed') {
        // Partial match for breed
        const breed = (pet.primary_breed || '').toLowerCase();
        if (!breed.includes(value.toLowerCase())) return false;
      } else if (key === 'sex') {
        if (pet.sex !== value) return false;
      } else if (key === 'age') {
        if (pet.age !== value) return false;
      } else if (key === 'size') {
        if (pet.size !== value) return false;
      }
    }
    return true;
  });
}

export function sortPets(pets, sortBy) {
  if (!pets || !Array.isArray(pets)) return [];
  
  const sorted = [...pets];
  
  switch(sortBy) {
    case 'name':
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'newest':
    default:
      // Keep original order for newest/default
      break;
  }
  
  return sorted;
}

export function createFilterUI(filters) {
  const container = document.createElement('div');
  container.className = 'pet-filters';
  
  // Create filter selects
  const filterConfigs = [
    { name: 'sex', options: filters.sexes || [] },
    { name: 'age', options: filters.ages || [] },
    { name: 'size', options: filters.sizes || [] }
  ];
  
  filterConfigs.forEach(config => {
    const wrapper = document.createElement('div');
    wrapper.className = 'filter-group';
    
    const label = document.createElement('label');
    label.textContent = config.name.charAt(0).toUpperCase() + config.name.slice(1);
    label.setAttribute('for', `filter-${config.name}`);
    
    const select = document.createElement('select');
    select.name = config.name;
    select.id = `filter-${config.name}`;
    
    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    select.appendChild(allOption);
    
    // Add specific options
    config.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      select.appendChild(option);
    });
    
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    container.appendChild(wrapper);
  });
  
  return container;
}