import SuggestionsSideTab from '../../components/suggestions-side-tab';
import SuggestionsSortTab from '../../components/suggestions-sort-tab';
import SuggestionsList from '../../components/suggestions-list';
import style from './home.module.scss';

const Home = () => (
  <div className={style.home}>
    <SuggestionsSideTab />
    <SuggestionsSortTab />
    <SuggestionsList />
  </div>
);

export default Home;
