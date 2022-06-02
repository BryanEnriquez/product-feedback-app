import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import FormWrapper from '../layout/FormWrapper';
import FormItem from '../components/FormItem';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';
import { submitSuggestion } from '../features/suggestions/suggestionThunks';
import { categories } from '../config/formCategories';

function FeedbackForm() {
  const [title, setTitle] = useState('');
  const [titleErr, setTitleErr] = useState(null);
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [descriptiontErr, setDescriptiontErr] = useState(null);
  const [requestErr, setRequestErr] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const dispatch = useDispatch();

  const handleSubmit = e => {
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

    dispatch(submitSuggestion({ title, description, category }))
      .unwrap()
      .then(id => {
        navigate(`/feedback/${id}`, { replace: true });
      })
      .catch(err => {
        setRequestErr(err);
        setTimeout(() => {
          setDisabled(false);
        }, 1000);
      });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
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
      <div className="form__item">
        <label htmlFor="fb-description">Feedback Detail</label>
        <p>
          Include any specific comments on what should be improved, added, etc.
        </p>
        <textarea
          className={`form__input${descriptiontErr ? ' form__input--err' : ''}`}
          value={description}
          onChange={e => setDescription(e.target.value)}
          id="fb-description"
        />
        <span className="form__err">{descriptiontErr}</span>
      </div>
      <div className="form__btns form__btns--2">
        <Button
          label="Add Feedback"
          disabled={disabled}
          onSubmit={handleSubmit}
        />
        <Button
          to={loc.state?.prevPage || '/'}
          label="Cancel"
          disabled={disabled}
          color="dark"
        />
      </div>
    </form>
  );
}

function NewFeedback() {
  return (
    <FormWrapper title="Create New Feedback" type="create">
      <FeedbackForm />
    </FormWrapper>
  );
}

export default NewFeedback;
