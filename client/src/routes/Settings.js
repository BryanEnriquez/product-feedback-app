import { useState } from 'react';
import { useSelector } from 'react-redux';
import BackLink from '../components/BackLink';
import { selectCurrentUser } from '../features/user/currentUserSlice';
import { settings } from '../features/user/settings-forms';
import '../css/Settings.scss';

function Settings() {
  const [option, setOption] = useState(settings[0]);
  const [optionLocked, setOptionLocked] = useState(false);
  const currentUser = useSelector(selectCurrentUser);

  const Form = option.Form;

  return (
    <div className="settings">
      <nav className="settings__nav">
        <BackLink color="white" />
        <h1>Settings</h1>
      </nav>
      <div className="settings__main">
        <ul className="settings__tabs">
          {settings.map((el, i) => (
            <li key={el.id}>
              <button
                type="button"
                onClick={() => !optionLocked && setOption(settings[i])}
                className={`settings__btn${
                  el.id === option.id ? ' settings__btn--active' : ''
                }`}
              >
                {el.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="settings__form-wrapper">
          <Form currentUser={currentUser} setOptionLocked={setOptionLocked} />
        </div>
      </div>
    </div>
  );
}

export default Settings;
