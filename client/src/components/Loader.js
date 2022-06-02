import '../css/Loader.scss';

function Loader({ type = 'a' }) {
  return <div className={`loader loader--${type}`} />;
}

export default Loader;
