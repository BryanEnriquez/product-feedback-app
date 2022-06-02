import '../css/ErrorMsg.scss';

const ErrorMsg = ({ msg }) => (
  <div className="err-msg">{`An error occured: ${msg}`}</div>
);

export default ErrorMsg;
