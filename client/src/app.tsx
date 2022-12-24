import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RequireAuth from './components/require-auth';
import RequireNoAuth from './components/require-no-auth';
import LoadUser from './components/load-user';
import Scroller from './components/scroller';
import Main from './layout/main';
import Home from './routes/home';
import FeedbackPage from './routes/feedback';
import NewFeedback from './routes/new-feedback';
import RoadmapPage from './routes/roadmap';
import Login from './routes/login';
import Signup from './routes/signup';
import ActivateAccount from './routes/activate-account';
import EditFeedback from './routes/edit-feedback';
import SettingsPage from './routes/settings';
import NotFound from './routes/not-found';
import './styles/app.scss';
import './styles/form.scss';

const App = () => (
  <BrowserRouter>
    <LoadUser />
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
              <SettingsPage />
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

export default App;
