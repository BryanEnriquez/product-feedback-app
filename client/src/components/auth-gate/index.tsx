import style from './auth.module.scss';

const AuthGate = ({ text }: { text: string }) => (
  <div className={style.authGate}>
    <h1>{text}</h1>
  </div>
);

export default AuthGate;
