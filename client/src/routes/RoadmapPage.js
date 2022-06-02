import RoadmapNav from '../features/roadmap/RoadmapNav';
import RoadmapView from '../features/roadmap/RoadmapView';
import '../css/RoadmapPage.scss';

function RoadmapPage() {
  return (
    <div className="rm-page">
      <RoadmapNav />
      <RoadmapView />
    </div>
  );
}

export default RoadmapPage;
