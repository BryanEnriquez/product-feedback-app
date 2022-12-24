import RoadmapNav from '../../components/roadmap-nav';
import RoadmapView from '../../components/roadmap-view';
import style from './page.module.scss';

const RoadmapPage = () => (
  <div className={style.page}>
    <RoadmapNav />
    <RoadmapView />
  </div>
);

export default RoadmapPage;
