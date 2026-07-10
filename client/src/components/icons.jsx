// Minimal inline icon set - deliberately not pulling in an icon library
// dependency for a handful of glyphs. Each icon inherits color via
// `currentColor` so it can be styled from CSS like text.

export function PlusIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PencilIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M11.3 2.3a1.4 1.4 0 0 1 2 2L5.5 12.1l-2.8.7.7-2.8 7.9-7.7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5v8a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M8 1.5 15 14H1L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8 6.5v3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="11.7" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function PeopleIcon(props) {
  return (
    <svg width="34" height="34" viewBox="0 0 32 32" fill="none" {...props}>
      <circle cx="13" cy="11" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 25.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M20 8.5c1.9.4 3.3 2 3.3 3.9 0 1.9-1.4 3.5-3.3 3.9M23 25.5c0-2.9-1.8-5-4.4-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
