import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../user/currentUserSlice';
import BackLink from '../../components/BackLink';
import NewFbBtn from '../../components/NewFbBtn';
import '../../css/RoadmapNav.scss';

function RoadmapNav() {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <nav className="rm-nav">
      <div className="rm-nav__left">
        <BackLink color="white" />
        <h1>Roadmap</h1>
      </div>
      <NewFbBtn currentUser={currentUser} />
    </nav>
  );
}

export default RoadmapNav;
