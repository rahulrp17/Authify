export const formatDate = (value, options = {}) => {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(date);
};

export const formatDateOnly = (value) =>
  formatDate(value, { dateStyle: 'medium', timeStyle: undefined });

export const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'A';

export const getFirstName = (name = '') => name.trim().split(/\s+/)[0] || 'Operator';
