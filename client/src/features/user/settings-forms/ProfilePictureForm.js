import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Button from '../../../components/Button';
import ImgFigure from '../../../components/ImgFigure';
import { updateUserImg } from '../currentUserSlice';
import ax from '../../../utils/axios';
import { getAvatarUrl } from '../../../utils/s3UserUrl';
import noSelectionImg from '../../../images/shared/icon-missing-file.svg';
import '../../../css/ProfilePictureForm.scss';

function ProfilePictureForm({ currentUser, setOptionLocked }) {
  const [img, setImg] = useState(null);
  const [imgSelected, setImgSelected] = useState(false);
  const [imgPreview, setImgPreview] = useState('');
  const [profileSrc, setProfileSrc] = useState(currentUser.profileImg);

  const [status, setStatus] = useState('idle');
  const [reqErr, setReqErr] = useState(null);
  const formRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const ref = formRef;
    return () => {
      if (ref.current) return;
      URL.revokeObjectURL(img);
    };
  }, [img]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (status !== 'idle') return;

    setReqErr(null);
    setOptionLocked(true);
    setStatus('uploading');

    const unlock = () => {
      setOptionLocked(false);
      setStatus('idle');
    };

    const getErr = err =>
      err.response.data?.message || 'Unable to reach server. Try again later.';

    let res;
    try {
      res = (await ax.get('/users/sign-s3')).data.data;
    } catch (err) {
      unlock();
      return setReqErr(getErr(err));
    }

    try {
      await axios.put(res.signedRequest, img, {
        headers: { 'Content-Type': 'image/jpeg' },
      });
    } catch (_) {
      unlock();
      return setReqErr('Error with uploading image.');
    }

    try {
      const { data } = await ax.patch('/users/updateProfileImg');

      const { profileImg } = data.data.data;

      URL.revokeObjectURL(img);
      dispatch(updateUserImg(profileImg));
      setImg(null);
      setImgSelected(false);
      setImgPreview('');

      // Clear src to force img rerender later
      setProfileSrc('');

      fetch(profileImg, { cache: 'reload', mode: 'cors' })
        .then(_ => setProfileSrc(profileImg))
        .catch(_ =>
          setReqErr('Failed to reload image, try reloading the page.')
        );
    } catch (err) {
      setReqErr(getErr(err));
    } finally {
      unlock();
    }
  };

  const handleFileSelect = e => {
    if (status !== 'idle') return;

    if (img) URL.revokeObjectURL(img);
    setReqErr(null);

    const [file] = e.target.files;

    if (!file || file.type !== 'image/jpeg' || file.size > 50000) {
      setImg(null);
      setImgSelected(false);
      setImgPreview('');
    } else {
      setImg(file);
      setImgSelected(true);
      setImgPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="profile-pic-wrapper">
      <div className="profile-imgs">
        <ImgFigure
          src={profileSrc ? getAvatarUrl(profileSrc) : ''}
          alt={`${currentUser.firstName}'s current profile picture`}
          caption="Current image"
          circle={currentUser.profileImg}
        />
        <ImgFigure
          src={imgPreview || noSelectionImg}
          alt={
            imgSelected
              ? 'Preview of selected image file'
              : 'Icon indicating no image was selected.'
          }
          caption={
            imgSelected ? 'Preview of selected image' : 'No preview to show'
          }
          circle={imgSelected}
        />
      </div>
      <form className="form" onSubmit={handleSubmit} ref={formRef}>
        {reqErr && <span className="form__req-err">{reqErr}</span>}
        <div className="form__item">
          <label htmlFor="profile-pic-preview">Upload An Image</label>
          <p>Accepted format(s): jpg/jpeg. Max size: 50 KB.</p>
          <input
            type="file"
            id="profile-pic-preview"
            onChange={handleFileSelect}
            disabled={status !== 'idle'}
            accept="image/jpeg"
            multiple={false}
          />
        </div>
        <div className="form__btns form__btns--1 form__btns--e">
          <Button
            label={status === 'idle' ? 'Update' : 'Uploading..'}
            onSubmit={handleSubmit}
            disabled={!imgSelected || status !== 'idle'}
          />
        </div>
      </form>
    </div>
  );
}

export default ProfilePictureForm;
