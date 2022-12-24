import AddFeedbackButton from '../new-feedback-button';
import type { CurrentUserStates } from '../../@types';
import style from './noContent.module.scss';

const NoContent = ({ currentUser }: { currentUser: CurrentUserStates }) => (
  <div className={style.noContent}>
    <i />
    <h3>There is no feedback yet.</h3>
    <p>
      Got a suggestion? Found a bug that needs to be squashed? We love hearing
      about new ideas to improve our app.
    </p>
    <div className={style.noContent__cta}>
      <AddFeedbackButton currentUser={currentUser} />
    </div>
  </div>
);

export default NoContent;
