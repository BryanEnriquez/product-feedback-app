import { createAction } from '@reduxjs/toolkit';
import type { ProductRequestRoadmap, RoadmapUpdatePayload } from '../../@types';

const ROADMAP = 'roadmap';

export const removeOneRmSuggestion = createAction<
  Pick<ProductRequestRoadmap, 'productRequestId' | 'status'>
>(`${ROADMAP}/removeOneRmSuggestion`);

export const updateOneRmSuggestion = createAction<RoadmapUpdatePayload>(
  `${ROADMAP}/updateOneRmSuggestion`
);
