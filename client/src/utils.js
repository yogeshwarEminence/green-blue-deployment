// Small, dependency-free helpers that turn plain strings (names, department
// titles) into consistent visual identifiers - the same person or department
// always gets the same color, without hardcoding a lookup table.

const AVATAR_PALETTE = [
  '#3B4FE0', // indigo
  '#0E9488', // teal
  '#D9622B', // clay
  '#7C5CE0', // violet
  '#1E9E6D', // green
  '#D6407F', // magenta
];

const DEPARTMENT_PALETTE = [
  { bg: '#EEF0FE', text: '#3B4FE0' }, // indigo
  { bg: '#EAF7F5', text: '#0E7A70' }, // teal
  { bg: '#FCEEE4', text: '#B24E1D' }, // clay
  { bg: '#F1EDFC', text: '#6541C9' }, // violet
  { bg: '#E9F7EF', text: '#177A50' }, // green
  { bg: '#FCEAF2', text: '#B23566' }, // magenta
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function getAvatarColor(name) {
  const index = hashString(name || '') % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

export function getDepartmentColors(department) {
  const index = hashString(department || '') % DEPARTMENT_PALETTE.length;
  return DEPARTMENT_PALETTE[index];
}

export function formatEmployeeId(id) {
  return `EMP-${String(id).padStart(4, '0')}`;
}
