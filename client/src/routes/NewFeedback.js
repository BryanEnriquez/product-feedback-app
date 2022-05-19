import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import FeedbackFormWrapper from '../layout/FeedbackFormWrapper';
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
  const dispatch = useDispatch();

  const onCategoryChange = val => setCategory(val);

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
        navigate(`/feedback/${id}`);
      })
      .catch(err => {
        setRequestErr(err);
        setTimeout(() => {
          setDisabled(false);
        }, 1000);
      });
  };

  return (
    <form className="fb-form" onSubmit={handleSubmit}>
      {requestErr && <span className="fb-form__req-err">{requestErr}</span>}
      <div className="fb-form__item">
        <label htmlFor="fb-title">Feedback Title</label>
        <p>Add a short, descriptive headline</p>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          id="fb-title"
        />
        <span className="fb-form__err">{titleErr}</span>
      </div>
      <div>
        <Dropdown
          label="Category"
          description="Choose a category for your feedback"
          options={categories}
          selected={category}
          setSelected={onCategoryChange}
          disabled={false}
          type="b"
        />
        <span className="fb-form__err">&nbsp;</span>
      </div>
      <div className="fb-form__item">
        <label htmlFor="fb-description">Feedback Detail</label>
        <p>
          Include any specific comments on what should be improved, added, etc.
        </p>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          id="fb-description"
        />
        <span className="fb-form__err">{descriptiontErr}</span>
      </div>
      <div className="fb-form__btns fb-form__btns--create">
        <Button
          label="Add Feedback"
          disabled={disabled}
          onSubmit={handleSubmit}
        />
        <Button to="/" label="Cancel" disabled={disabled} color="dark" />
      </div>
    </form>
  );
}

function NewFeedback() {
  return (
    <FeedbackFormWrapper backLink="/" title="Create New Feedback" type="create">
      <FeedbackForm />
    </FeedbackFormWrapper>
  );
}

export default NewFeedback;
