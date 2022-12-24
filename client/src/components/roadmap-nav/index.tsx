import { useAppSelector } from '../../hooks';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import BackLink from '../back-link';
import AddFeedbackButton from '../new-feedback-button';
import style from './nav.module.scss';

const RoadmapNav = () => {
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <nav className={style.nav}>
      <div>
        <BackLink color="white" />
        <h1>Roadmap</h1>
      </div>
      <AddFeedbackButton currentUser={currentUser} />
    </nav>
  );
};

export default RoadmapNav;
