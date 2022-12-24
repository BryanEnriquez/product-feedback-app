import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks';
import FormWrapper from '../../layout/form-wrapper';
import FormItem from '../../components/form-item';
import Dropdown from '../../components/dropdown';
import Button from '../../components/button';
import { submitSuggestion } from '../../features/suggestions/suggestionsThunks';
import { categories } from '../../config/formCategories';

const FeedbackForm = () => {
  const [title, setTitle] = useState('');
  const [titleErr, setTitleErr] = useState<string | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [descriptionErr, setDescriptionErr] = useState<string | null>(null);
  const [requestErr, setRequestErr] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
      setDescriptionErr('Description must be between 20 and 200 characters.');
      validationErr = true;
    } else setDescriptionErr(null);

    if (validationErr) return;

    setDisabled(true);
    setRequestErr(null);

    dispatch(
      submitSuggestion({
        title: titleInput,
        description: descriptionInput,
        category: category.id,
      })
    )
      .unwrap()
      .then((id) => navigate(`/feedback/${id}`, { replace: true }))
      .catch((err: Error) => {
        setRequestErr(err.message);
        setTimeout(() => setDisabled(false), 1000);
      });
  };

  return (
    <form className="form" onSubmit={onFormSubmit}>
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
      <div className="form__item">
        <label htmlFor="fb-description">Feedback Detail</label>
        <p>
          Include any specific comments on what should be improved, added, etc.
        </p>
        <textarea
          className={`form__input${descriptionErr ? ' form__input--err' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          id="fb-description"
        />
        <span className="form__err">{descriptionErr}</span>
      </div>
      <div className="form__btns form__btns--2">
        <Button label="Add Feedback" disabled={disabled} />
        <Button
          to={location.state ? location.state.prevPage || '/' : '/'}
          label="Cancel"
          disabled={disabled}
          color="dark"
        />
      </div>
    </form>
  );
};

const NewFeedback = () => (
  <FormWrapper title="Create New Feedback" icon="create">
    <FeedbackForm />
  </FormWrapper>
);

export default NewFeedback;
