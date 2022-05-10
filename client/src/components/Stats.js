// import { useSelector } from "react-redux";
import '../css/Stats.scss';

const labels = [
  ['Planned', 'planned'],
  ['In-Progress', 'in-progress'],
  ['Live', 'live'],
];

function Stats() {
  // const roadmapStats = useSelector();

  const renderedStats = labels.map(el => (
    <li key={el[1]}>
      <span>{el[0]}</span>
      {/* <span>{}</span> */}
    </li>
  ));

  return (
    <div className="stats">
      <span className="stats__title">Roadmap</span>
      <a href="/">View</a>
      <ul>{renderedStats}</ul>
    </div>
  );
}

export default Stats;
