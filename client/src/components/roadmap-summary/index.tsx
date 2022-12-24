import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  selectRmSummary,
  selectRmSummaryStatus,
  fetchRmSummary,
} from '../../features/roadmap/roadmapSlice';
import type { RoadmapStatus } from '../../@types';
import style from './summary.module.scss';

const labels: [string, RoadmapStatus][] = [
  ['Planned', 'planned'],
  ['In-Progress', 'in-progress'],
  ['Live', 'live'],
];

const RoadmapSummary = () => {
  const summary = useAppSelector(selectRmSummary);
  const fetchStatus = useAppSelector(selectRmSummaryStatus);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fetchStatus !== 'idle') return;

    dispatch(fetchRmSummary());
  }, [dispatch, fetchStatus]);

  return (
    <div className={style.summary}>
      <h2 className={style.summary__title}>Roadmap</h2>
      <Link
        to="/roadmap"
        className={
          style.summary__link +
          (!summary.all ? ' ' + style['summary__link--none'] : '')
        }
        state={{ prevPage: '/' }}
      >
        View
      </Link>
      <ul>
        {labels.map((el) => (
          <li key={el[1]}>
            <span>{el[0]}</span>
            <span>{summary[el[1]]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoadmapSummary;
