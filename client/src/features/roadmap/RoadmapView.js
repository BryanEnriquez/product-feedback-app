import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../../components/Card';
import Feedback from '../../components/Feedback';
import ErrorMsg from '../../components/ErrorMsg';
import Button from '../../components/Button';
import { selectCurrentUser } from '../user/currentUserSlice';
import {
  fetchRmSuggestions,
  selectRmTotal,
  selectRmFetchStatus,
  selectCanLoadMore,
  selectRmGroups,
  selectError,
} from './roadmapSlice';
import '../../css/RoadmapView.scss';

const options = [
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

function RoadmapView() {
  const [selected, setSelected] = useState(options[1]);
  const currentUser = useSelector(selectCurrentUser);
  const total = useSelector(selectRmTotal);
  const fetchStatus = useSelector(selectRmFetchStatus);
  const canLoadMore = useSelector(selectCanLoadMore);
  const groups = useSelector(selectRmGroups);
  const error = useSelector(selectError);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fetchStatus === 'idle') dispatch(fetchRmSuggestions());
  }, [dispatch, fetchStatus]);

  let content;

  if (fetchStatus === 'rejected') {
    content = <ErrorMsg msg={error} />;
  } else {
    content = (
      <div className="rm-view">
        <ul className="rm-view__stats">
          {options.map(el => (
            <li
              key={el.value}
              className={`rm-view__stat rm-view__stat--${el.cardConfig.color}${
                el.value === selected.value ? ' rm-view__stat--active' : ''
              }`}
              onClick={() => setSelected(el)}
            >
              {`${el.label} (${total[el.value]})`}
            </li>
          ))}
        </ul>
        <div className="rm-view__all">
          {options.map((el, i) => (
            <div
              key={el.value}
              className={`rm-view__group${
                el.value === selected.value ? ' rm-view__group--active' : ''
              }`}
            >
              <h2>{`${el.label} (${total[el.value]})`}</h2>
              <p>{el.desc}</p>
              <div className="rm-view__items">
                {groups[i].map(fb => (
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
                      prevPage={'/roadmap'}
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
    );
  }

  return <div className="rm-view-wrapper">{content}</div>;
}

export default RoadmapView;
