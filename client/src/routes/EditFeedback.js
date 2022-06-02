import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import FormWrapper from '../layout/FormWrapper';
import FormItem from '../components/FormItem';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';
import { selectSuggestionById } from '../features/suggestions/suggestionsSlice';
import {
  addInvalidFbId,
  selectCurrentUser,
} from '../features/user/currentUserSlice';
import { selectRmSuggestionById } from '../features/roadmap/roadmapSlice';
import {
  fetchOneSuggestion,
  updateFeedback,
  deleteFeedback,
} from '../features/suggestions/suggestionThunks';
import { categories, categoriesObj } from '../config/formCategories';
import { statusOptions, statusObj } from '../config/formStatus';

function EditFeedbackForm({ feedback }) {
  const [title, setTitle] = useState(feedback.title);
  const [titleErr, setTitleErr] = useState(null);
  const [category, setCategory] = useState(categoriesObj[feedback.category]);
  const [status, setStatus] = useState(statusObj[feedback.status]);
  const [description, setDescription] = useState(feedback.description);
  const [descriptiontErr, setDescriptiontErr] = useState(null);
  const [requestErr, setRequestErr] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const dispatch = useDispatch();

  const handleUpdate = e => {
    e.preventDefault();
    if (disabled) return;

    let validationErr = false;

    const titleInput = title.trim();
    if (titleInput.length < 10 || titleInput.length > 50) {
      setTitleErr('Title must be between 10 and 50 characters.');
      validationErr = true;
    } else {
      setTitleErr(null);
    }

    const descriptionInput = description.trim();
    if (descriptionInput.length < 20 || descriptionInput.length > 200) {
      setDescriptiontErr('Description must be between 20 and 200 characters.');
      validationErr = true;
    } else {
      setDescriptiontErr(null);
    }

    if (validationErr) return;
    setDisabled(true);
    setRequestErr(null);

    dispatch(
      updateFeedback({
        prevFb: feedback,
        updatedFb: {
          title,
          description,
          status: status.id,
          category: category.id,
        },
      })
    )
      .unwrap()
      .then(() => {
        navigate(`/feedback/${feedback.productRequestId}`, { replace: true });
      })
      .catch(err => {
        setRequestErr(err);
        setTimeout(() => {
          setDisabled(false);
        }, 1000);
      });
  };

  const handleDelete = () => {
    if (disabled) return;

    if (deleteConfirmed) {
      setDisabled(true);
      dispatch(deleteFeedback(feedback))
        .unwrap()
        .then(() => {
          dispatch(addInvalidFbId(feedback.productRequestId));
          navigate('/', { replace: true });
        })
        .catch(err => {
          setRequestErr(err);
          setTimeout(() => {
            setDisabled(false);
            setDeleteConfirmed(false);
          }, 1500);
        });
    } else {
      setDeleteConfirmed(true);
      setTimeout(() => {
        if (!disabled) setDeleteConfirmed(false);
      }, 1000 * 5);
    }
  };

  return (
    <form className="form" onSubmit={handleUpdate}>
      {requestErr && <span className="form__req-err">{requestErr}</span>}
      <FormItem
        id="fb-title"
        label="Feedback Title"
        desc="Add a short, descriptive headline"
        val={title}
        setVal={setTitle}
        err={titleErr}
      />
      <div>
        <Dropdown
          label="Category"
          description="Choose a category for your feedback"
          options={categories}
          selected={category}
          setSelected={setCategory}
          disabled={false}
          type="b"
        />
        <span className="form__err">&nbsp;</span>
      </div>
      <div>
        <Dropdown
          label="Update Status"
          description="Change feature state"
          options={statusOptions}
          selected={status}
          setSelected={setStatus}
          disabled={false}
          type="b"
        />
        <span className="form__err">&nbsp;</span>
      </div>
      <div className="form__item">
        <label htmlFor="fb-description">Feedback Detail</label>
        <p>
          Include any specific comments on what should be improved, added, etc.
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          id="fb-description"
        />
        <span className="form__err">{descriptiontErr}</span>
      </div>
      <div className="form__btns form__btns--3">
        <Button
          label="Save Changes"
          disabled={disabled}
          onSubmit={handleUpdate}
        />
        <Button
          label="Cancel"
          disabled={disabled}
          color="dark"
          onClick={() => !disabled && navigate(loc.state?.prevPage || '/')}
        />
        <Button
          label={deleteConfirmed ? 'Confirm' : 'Delete'}
          disabled={disabled}
          color="red"
          onClick={handleDelete}
        />
      </div>
    </form>
  );
}

function EditFeedback() {
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState(null);
  const currentUser = useSelector(selectCurrentUser);
  const urlParams = useParams();
  const suggestion = useSelector(state =>
    selectSuggestionById(state, urlParams.productRequestId)
  );
  const rmSuggestion = useSelector(state =>
    selectRmSuggestionById(state, urlParams.productRequestId)
  );
  const dispatch = useDispatch();
  const feedback = suggestion || rmSuggestion;

  useEffect(() => {
    if (status !== 'idle') return;

    // Set to 'fulfilled' so fetch isn't attempted again after deleting a record
    if (feedback) {
      setStatus('fulfilled');
      return;
    }

    setStatus('pending');

    dispatch(
      fetchOneSuggestion({ id: urlParams.productRequestId, user: currentUser })
    )
      .unwrap()
      .then(() => setStatus('fulfilled'))
      .catch(err => {
        setStatus('rejected');
        setErr(err);
      });
  }, [feedback, status, urlParams.productRequestId, currentUser, dispatch]);

  const wrapperProps = { type: 'edit', title: '' };

  if (!feedback) {
    if (status === 'pending') wrapperProps.title = 'Loading suggestion,';
    else if (status === 'rejected') wrapperProps.title = err;
    return <FormWrapper {...wrapperProps} />;
  }

  wrapperProps.title =
    feedback.accountUid !== currentUser.accountUid
      ? 'You may only edit feedback you submitted.'
      : `Editing '${feedback.title}'`;

  return (
    <FormWrapper {...wrapperProps}>
      <EditFeedbackForm feedback={feedback} />
    </FormWrapper>
  );
}

export default EditFeedback;
