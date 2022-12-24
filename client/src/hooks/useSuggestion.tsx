import { useParams } from 'react-router-dom';
import { useAppSelector } from '.';
import { selectSuggestionById } from '../features/suggestions/suggestionsSlice';
import { selectRmSuggestionById } from '../features/roadmap/roadmapSlice';

/**
 * @returns The extracted id, A suggestion with a matching id if found
 */
export const useSuggestion = () => {
  const id = useParams().productRequestId!;
  const suggestion = useAppSelector((state) => selectSuggestionById(state, id));
  const rmSuggestion = useAppSelector((state) =>
    selectRmSuggestionById(state, id)
  );

  return [id, suggestion || rmSuggestion] as const;
};
