import { useState } from 'react';
import { useAppSelector } from '../../hooks';
import BackLink from '../../components/back-link';
import { selectCurrentUser } from '../../features/user/currentUserSlice';
import { settings } from '../../features/user/settings-forms';
import style from './settings.module.scss';

const SettingsPage = () => {
  const [option, setOption] = useState(settings[0]);
  const [optionLocked, setOptionLocked] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);

  const { Form } = option;

  if (!currentUser) return null;

  return (
    <div className={style.settings}>
      <nav className={style.settings__nav}>
        <BackLink color="white" />
        <h1>Settings</h1>
      </nav>
      <div className={style.settings__main}>
        <ul className={style.settings__tabs}>
          {settings.map((el, i) => (
            <li key={el.id}>
              <button
                type="button"
                onClick={() => !optionLocked && setOption(settings[i])}
                className={`${style.settings__btn}${
                  el.id === option.id
                    ? ` ${style['settings__btn--active']}`
                    : ''
                }`}
              >
                {el.label}
              </button>
            </li>
          ))}
        </ul>
        <div className={style.settings__formWrapper}>
          <Form currentUser={currentUser} setOptionLocked={setOptionLocked} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
