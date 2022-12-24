import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import Card from '../card';
import Feedback from '../feedback';
import ErrorMsg from '../error-message';
import Button from '../button';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import {
  fetchRmSuggestions,
  selectRmTotal,
  selectRmFetchStatus,
  selectCanLoadMore,
  selectRmGroups,
  selectError,
} from '../../features/roadmap/roadmapSlice';
import type { ProductRequestStatus } from '../../@types';
import style from './view.module.scss';

type RoadmapGroup = {
  label: string;
  value: Exclude<ProductRequestStatus, 'suggestion'>;
  desc: string;
  cardConfig: { label: string; color: 'orange' | 'violet' | 'blue' };
};

const roadmapGroups: RoadmapGroup[] = [
  {
    label: 'Planned',
    value: 'planned',
    desc: 'Ideas prioritized for research',
    cardConfig: { label: 'Planned', color: 'orange' },
  },
  {
    label: 'In-Progress',
    value: 'in-progress',
    desc: 'Currently being developed',
    cardConfig: { label: 'In Progress', color: 'violet' },
  },
  {
    label: 'Live',
    value: 'live',
    desc: 'Released features',
    cardConfig: { label: 'Live', color: 'blue' },
  },
];

const RoadmapView = () => {
  const [selected, setSelected] = useState(roadmapGroups[1]);
  const currentUser = useAppSelector(selectCurrentUser);
  const roadmapStats = useAppSelector(selectRmTotal);
  const fetchStatus = useAppSelector(selectRmFetchStatus);
  const canLoadMore = useAppSelector(selectCanLoadMore);
  const groups = useAppSelector(selectRmGroups);
  const error = useAppSelector(selectError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fetchStatus === 'idle') dispatch(fetchRmSuggestions());
  }, [dispatch, fetchStatus]);

  return (
    <div className={style.viewWrapper}>
      {fetchStatus === 'rejected' ? (
        <ErrorMsg msg={error || 'Unable to load data.'} />
      ) : (
        <div className={style.view}>
          <ul className={style.view__stats}>
            {roadmapGroups.map((el) => (
              <li
                key={el.value}
                className={`${style.view__stat} ${
                  style[`view__stat--${el.cardConfig.color}`]
                }${
                  el.value === selected.value
                    ? ` ${style['view__stat--active']}`
                    : ''
                }`}
                onClick={() => setSelected(el)}
              >
                {`${el.label} (${roadmapStats[el.value]})`}
              </li>
            ))}
          </ul>
          <div className={style.view__groups}>
            {roadmapGroups.map((el, i) => (
              <div
                key={el.value}
                className={`${style.view__group}${
                  el.value === selected.value
                    ? ` ${style['view__group--active']}`
                    : ''
                }`}
              >
                <h2>{`${el.label} (${roadmapStats[el.value]})`}</h2>
                <p>{el.desc}</p>
                <div className={style.view__items}>
                  {groups[i].map((fb) => (
                    <Card
                      key={fb.productRequestId}
                      label={el.cardConfig.label}
                      color={el.cardConfig.color}
                    >
                      <Feedback
                        item={fb}
                        dispatch={dispatch}
                        currentUser={currentUser}
                        type="b"
                        prevPage="/roadmap"
                      />
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {canLoadMore && (
            <Button
              label="Load More Results"
              color="blue"
              disabled={fetchStatus !== 'fulfilled'}
              onClick={() => dispatch(fetchRmSuggestions())}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default RoadmapView;
