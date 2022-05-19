import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import CurrentUser from './features/user/CurrentUser';
import Main from './layout/Main';
import Home from './routes/Home';
import FeedbackPage from './routes/FeedbackPage';
import NewFeedback from './routes/NewFeedback';
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
          <Route path="feedback/:productRequestId" element={<FeedbackPage />} />
          <Route path="edit-feedback/:productRequestId" element={<div />} />
          <Route
            path="new-feedback"
            element={
              <RequireAuth>
                <NewFeedback />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
