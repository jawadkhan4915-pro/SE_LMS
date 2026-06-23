export const getDepartmentFullName = (dep) => {
  const mapping = {
    SE: 'Software Engineering',
    CS: 'Computer Science',
    IT: 'Information Technology',
    EE: 'Electrical Engineering'
  };
  return mapping[dep] || 'Software Engineering';
};
