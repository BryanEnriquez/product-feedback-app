export const statusOptions = [
  { label: 'Suggestion', id: 'suggestion' },
  { label: 'Planned', id: 'planned' },
  { label: 'In-Progress', id: 'in-progress' },
  { label: 'Live', id: 'live' },
];

export const statusObj = statusOptions.reduce((obj, el) => {
  obj[el.id] = el;
  return obj;
}, {});
