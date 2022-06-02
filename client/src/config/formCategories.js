export const categories = [
  { label: 'Feature', id: 'feature' },
  { label: 'UI', id: 'ui' },
  { label: 'UX', id: 'ux' },
  { label: 'Enhancement', id: 'enhancement' },
  { label: 'Bug', id: 'bug' },
];

export const categoriesObj = categories.reduce((obj, el) => {
  obj[el.id] = el;
  return obj;
}, {});
