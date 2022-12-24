import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { useSuggestion } from '../../hooks/useSuggestion';
import FormWrapper from '../../layout/form-wrapper';
import FormItem from '../../components/form-item';
import Dropdown from '../../components/dropdown';
import Button from '../../components/button';
import {
  addInvalidFbId,
  selectCurrentUser,
} from '../../features/user/currentUserSlice';
import {
  fetchOneSuggestion,
  updateFeedback,
  deleteFeedback,
} from '../../features/suggestions/suggestionsThunks';
import { categories, categoriesObj } from '../../config/formCategories';
import { statusOptions, statusObj } from '../../config/formStatus';
import type { AppDispatch } from '../../store';
import type {
  ProductRequestSuggestion,
  ProductRequestRoadmap,
} from '../../@types';
import type { FormWrapperIcon } from '../../layout/form-wrapper';

type EditFeedbackFormProps = {
  feedback: ProductRequestSuggestion | ProductRequestRoadmap;
  dispatch: AppDispatch;
};

const EditFeedbackForm = ({ feedback, dispatch }: EditFeedbackFormProps) => {
  const [title, setTitle] = useState(feedback.title);
  const [titleErr, setTitleErr] = useState<string | null>(null);
  const [category, setCategory] = useState(categoriesObj[feedback.category]);
  const [status, setStatus] = useState(statusObj[feedback.status]);
  const [description, setDescription] = useState(feedback.description);
  const [descriptiontErr, setDescriptiontErr] = useState<string | null>(null);
  const [requestErr, setRequestErr] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;

    let validationErr = false;

    const titleInput = title.trim();
    const descriptionInput = description.trim();

    if (titleInput.length < 10 || titleInput.length > 50) {
      setTitleErr('Title must be between 10 and 50 characters.');
      validationErr = true;
    } else setTitleErr(null);

    if (descriptionInput.length < 20 || descriptionInput.length > 200) {
      setDescriptiontErr('Description must be between 20 and 200 characters.');
      validationErr = true;
    } else setDescriptiontErr(null);

    if (validationErr) return;

    setDisabled(true);
    setRequestErr(null);

    dispatch(
      updateFeedback({
        prevFb: feedback,
        updatedFb: {
          title: titleInput,
          description: descriptionInput,
          status: status.id,
          category: category.id,
        },
      })
    )
      .unwrap()
      .then(() =>
        navigate(`/feedback/${feedback.productRequestId}`, { replace: true })
      )
      .catch((err: Error) => {
        setRequestErr(err.message);
        setTimeout(() => setDisabled(false), 1000);
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
        .catch((err: Error) => {
          setRequestErr(err.message);
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
      {requestErr && <span className="form__reqErr">{requestErr}</span>}
      <FormItem
        id="fb-title"
        label="Feedback Title"
        desc="Add a short, descriptive headline"
        value={title}
        onChange={setTitle}
        err={titleErr}
      />
      <div>
        <Dropdown
          label="Category"
          description="Choose a category for your feedback"
          options={categories}
          selected={category}
          setSelected={setCategory}
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
          id="fb-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className="form__err">{descriptiontErr}</span>
      </div>
      <div className="form__btns form__btns--3">
        <Button label="Save Changes" disabled={disabled} />
        <Button
          label="Cancel"
          disabled={disabled}
          color="dark"
          onClick={() =>
            !disabled &&
            navigate(location.state ? location.state.prevPage || '/' : '/')
          }
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
};

const EditFeedback = () => {
  const [status, setStatus] = useState<
    'idle' | 'pending' | 'fulfilled' | 'rejected'
  >('idle');
  const [err, setErr] = useState('');
  const currentUser = useAppSelector(selectCurrentUser);
  const [id, feedback] = useSuggestion();
  const dispatch = useAppDispatch();

  // Fetch suggestion if not in memory (ex: after page refresh)
  useEffect(() => {
    if (status !== 'idle') return;

    if (feedback) {
      setStatus('fulfilled');
      return;
    }

    setStatus('pending');

    dispatch(fetchOneSuggestion({ id: Number(id), currentUser }))
      .unwrap()
      .then(() => setStatus('fulfilled'))
      .catch((err: string) => {
        setStatus('rejected');
        setErr(err);
      });
  }, [feedback, status, id, currentUser, dispatch]);

  const wrapperProps: { icon: FormWrapperIcon; title: string } = {
    icon: 'edit',
    title: '',
  };

  if (!feedback || !currentUser) {
    if (status === 'pending') wrapperProps.title = 'Loading suggestion';
    else if (status === 'rejected') wrapperProps.title = err;
    return <FormWrapper {...wrapperProps} />;
  }

  wrapperProps.title =
    feedback.accountUid !== currentUser.accountUid
      ? 'You may only edit feedback you submitted.'
      : `Editing '${feedback.title}'`;

  return (
    <FormWrapper {...wrapperProps}>
      <EditFeedbackForm feedback={feedback} dispatch={dispatch} />
    </FormWrapper>
  );
};

export default EditFeedback;
