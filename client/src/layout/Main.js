import { Outlet } from 'react-router-dom';
import '../css/Main.scss';

function Main() {
  return (
    <main className="main">
      <Outlet />
    </main>
  );
}

export default Main;
