import BackLink from '../components/BackLink';
import '../css/FeedbackFormWrapper.scss';

function FeedbackFormWrapper({ backLink, children, title, type }) {
  return (
    <div className="fb-form-wrapper">
      <BackLink to={backLink} />
      <div>
        <i className={`icon--${type}`} />
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}

export default FeedbackFormWrapper;
