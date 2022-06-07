import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import RequireNoAuth from './components/RequireNoAuth';
import CurrentUser from './features/user/CurrentUser';
import Main from './layout/Main';
import Home from './routes/Home';
import FeedbackPage from './routes/FeedbackPage';
import NewFeedback from './routes/NewFeedback';
import RoadmapPage from './routes/RoadmapPage';
import Login from './routes/Login';
import Signup from './routes/Signup';
import ActivateAccount from './routes/ActivateAccount';
import EditFeedback from './routes/EditFeedback';
import Settings from './routes/Settings';
import Scroller from './components/Scroller';
import NotFound from './routes/NotFound';
import './App.scss';

function App() {
  return (
    <BrowserRouter>
      <CurrentUser />
      <Scroller />
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
            path="signup"
            element={
              <RequireNoAuth>
                <Signup />
              </RequireNoAuth>
            }
          />
          <Route
            path="activate-account/:token"
            element={
              <RequireNoAuth>
                <ActivateAccount />
              </RequireNoAuth>
            }
          />
          <Route
            path="settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route path="feedback/:productRequestId" element={<FeedbackPage />} />
          <Route
            path="edit-feedback/:productRequestId"
            element={
              <RequireAuth>
                <EditFeedback />
              </RequireAuth>
            }
          />
          <Route
            path="new-feedback"
            element={
              <RequireAuth>
                <NewFeedback />
              </RequireAuth>
            }
          />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
