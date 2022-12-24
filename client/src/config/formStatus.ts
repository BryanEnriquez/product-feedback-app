import type { ProductRequestStatus } from '../@types';

type StatusOption = {
  label: string;
  id: ProductRequestStatus;
};

export const statusOptions: StatusOption[] = [
  { label: 'Suggestion', id: 'suggestion' },
  { label: 'Planned', id: 'planned' },
  { label: 'In-Progress', id: 'in-progress' },
  { label: 'Live', id: 'live' },
];

const obj: { [key in ProductRequestStatus]?: StatusOption } = {};

for (let i = 0; i < statusOptions.length; i++)
  obj[statusOptions[i].id] = statusOptions[i];

export const statusObj = obj as Required<typeof obj>;
