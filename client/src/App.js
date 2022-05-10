import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireNoAuth from './components/RequireNoAuth';
import CurrentUser from './features/user/CurrentUser';
import Main from './layout/Main';
import Home from './routes/Home';
import Suggestions from './routes/Suggestions';
import Login from './routes/Login';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <CurrentUser />
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="" element={<Home />} />
          <Route
            path="login"
            element={
              <RequireNoAuth>
                <Login />
              </RequireNoAuth>
            }
          />
          <Route
            path="suggestions/:productRequestId"
            element={<Suggestions />}
          />
          {/* <Route
            path="edit-suggestion/:productRequestId"
            element={<div />}
          /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
