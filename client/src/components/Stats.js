import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectRmSummary,
  selectRmSummaryStatus,
  fetchRmSummary,
} from '../features/roadmap/roadmapSlice';
import '../css/Stats.scss';

const labels = [
  ['Planned', 'planned'],
  ['In-Progress', 'in-progress'],
  ['Live', 'live'],
];

function Stats() {
  const summary = useSelector(selectRmSummary);
  const status = useSelector(selectRmSummaryStatus);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status !== 'idle') return;

    dispatch(fetchRmSummary());
  }, [dispatch, status]);

  const renderedStats = labels.map(el => (
    <li key={el[1]}>
      <span>{el[0]}</span>
      <span>{summary[el[1]]}</span>
    </li>
  ));

  return (
    <div className="stats">
      <h2 className="stats__title">Roadmap</h2>
      <Link
        to="/roadmap"
        className={`stats__link${!summary.all ? ' stats__link--none' : ''}`}
        state={{ prevPage: '/' }}
      >
        View
      </Link>
      <ul>{renderedStats}</ul>
    </div>
  );
}

export default Stats;
