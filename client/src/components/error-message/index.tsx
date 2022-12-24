import style from './errMsg.module.scss';

const ErrorMsg = ({ msg }: { msg: string }) => (
  <div className={style.errMsg}>{`An error occured: ${msg}`}</div>
);

export default ErrorMsg;
