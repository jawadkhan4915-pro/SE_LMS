export const getDepartmentFullName = (dep) => {
  if (!dep) return 'Software Engineering';

  try {
    const cached = localStorage.getItem('departments');
    if (cached) {
      const depts = JSON.parse(cached);
      if (Array.isArray(depts)) {
        const found = depts.find(d => d && d.code === dep);
        if (found && found.name) return found.name;
      }
    }
  } catch (err) {
    console.error('Error reading departments from localStorage:', err);
  }

  const mapping = {
    SE: 'Software Engineering',
    CS: 'Computer Science',
    IT: 'Information Technology',
    EE: 'Electrical Engineering'
  };
  return mapping[dep] || dep;
};
