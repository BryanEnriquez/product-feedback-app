import BackLink from '../components/BackLink';
import '../css/FormWrapper.scss';

function FormWrapper({ children, title, type }) {
  return (
    <div className="form-wrapper">
      <div className="form-wrapper__backlink">
        <BackLink />
      </div>
      <main className="form-wrapper__main">
        <i className={`icon--${type}`} />
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}

export default FormWrapper;
