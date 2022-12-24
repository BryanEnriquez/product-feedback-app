import type { ProductRequestCategory } from '../@types';

type DropdownCategoryOption = {
  label: string;
  id: ProductRequestCategory;
};

export const categories: DropdownCategoryOption[] = [
  { label: 'Feature', id: 'feature' },
  { label: 'UI', id: 'ui' },
  { label: 'UX', id: 'ux' },
  { label: 'Enhancement', id: 'enhancement' },
  { label: 'Bug', id: 'bug' },
];

const obj: { [key in ProductRequestCategory]?: DropdownCategoryOption } = {};

for (let i = 0; i < categories.length; i++)
  obj[categories[i].id] = categories[i];

export const categoriesObj = obj as Required<typeof obj>;
