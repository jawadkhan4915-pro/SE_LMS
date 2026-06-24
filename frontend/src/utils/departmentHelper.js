export const getDepartmentFullName = (dep) => {
  if (!dep) return 'Software Engineering';

  try {
    const cached = localStorage.getItem('departments');
    if (cached) {
      const depts = JSON.parse(cached);
      const found = depts.find(d => d.code === dep);
      if (found) return found.name;
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
