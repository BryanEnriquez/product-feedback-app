import { Outlet } from 'react-router-dom';
import style from './main.module.scss';

const Main = () => (
  <main className={style.main}>
    <Outlet />
  </main>
);

export default Main;
