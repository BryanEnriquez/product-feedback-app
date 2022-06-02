import NewFbBtn from './NewFbBtn';
import '../css/NoContent.scss';

function NoContent({ currentUser }) {
  return (
    <div className="no-content">
      <i />
      <h3>There is no feedback yet.</h3>
      <p>
        Got a suggestion? Found a bug that needs to be squashed? We love hearing
        about new ideas to improve our app.
      </p>
      <div className="no-content__cta">
        <NewFbBtn currentUser={currentUser} />
      </div>
    </div>
  );
}

export default NoContent;
