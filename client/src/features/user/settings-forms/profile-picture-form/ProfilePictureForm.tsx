import { useState, useEffect, useRef } from 'react';
import { useAppDispatch } from '../../../../hooks';
import Button from '../../../../components/button';
import ImgFigure from '../../../../components/img-figure';
import { updateUserImg } from '../../currentUserSlice';
import { client } from '../../../../client';
import { getAvatarUrl } from '../../../../utils/s3UserUrl';
import type { CurrentUser } from '../../../../@types';
import style from './form.module.scss';

type Props = {
  currentUser: CurrentUser;
  setOptionLocked: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProfilePictureForm = ({ currentUser, setOptionLocked }: Props) => {
  const [img, setImg] = useState<File | null>(null);
  const [imgSelected, setImgSelected] = useState(false);
  const [imgPreview, setImgPreview] = useState('');
  const [profileSrc, setProfileSrc] = useState(currentUser.profileImg);
  const [status, setStatus] = useState<'idle' | 'uploading'>('idle');
  const [reqErr, setReqErr] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const ref = formRef;
    return () => {
      if (ref.current || !imgPreview) return;
      URL.revokeObjectURL(imgPreview);
    };
  }, [imgPreview]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (status !== 'idle' || !img) return;

    setReqErr(null);
    setOptionLocked(true);
    setStatus('uploading');

    const unlock = () => {
      setOptionLocked(false);
      setStatus('idle');
    };

    type SignedRequestObj = { signedRequest: string };

    let res: SignedRequestObj;

    // Sign request
    try {
      res = (await client<SignedRequestObj>('users/sign-s3')).data;
    } catch (err) {
      unlock();
      return setReqErr((err as Error).message);
    }

    // Upload using signed request
    try {
      await client(
        { url: res.signedRequest },
        {
          method: 'PUT',
          file: {
            body: img,
            headers: {
              'Content-Type': 'image/jpeg',
            },
          },
          credentials: 'omit',
          skipResponseParse: true,
        }
      );
    } catch (_) {
      unlock();
      return setReqErr('Error uploading image.');
    }

    try {
      const { profileImg } = (
        await client<{ data: { profileImg: string } }>(
          'users/updateProfileImg',
          {
            method: 'PATCH',
          }
        )
      ).data.data;

      console.log('profileImg: ', profileImg);

      URL.revokeObjectURL(imgPreview);
      dispatch(updateUserImg(profileImg));
      setImg(null);
      setImgSelected(false);
      setImgPreview('');

      // Clear src to force img reload later
      setProfileSrc('');

      fetch(getAvatarUrl(profileImg), { cache: 'reload', mode: 'cors' })
        .then(() => setProfileSrc(profileImg))
        .catch(() =>
          setReqErr('Failed to reload image, try reloading the page.')
        );
    } catch (err) {
      setReqErr((err as Error).message);
    } finally {
      unlock();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status !== 'idle') return;

    if (imgPreview) URL.revokeObjectURL(imgPreview);

    setReqErr(null);

    const fileList = e.target.files;
    const file = fileList ? fileList[0] : null;

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
    <div className={style.profileWrapper}>
      <div className={style.profileImgs}>
        <ImgFigure
          src={profileSrc ? getAvatarUrl(profileSrc) : ''}
          alt={`${currentUser.firstName}'s current profile picture`}
          caption="Current image"
          circle={currentUser.profileImg}
        />
        <ImgFigure
          src={imgPreview || '/images/icon-missing-file.svg'}
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
      <form ref={formRef} className="form" onSubmit={handleSubmit}>
        {reqErr && <span className="form__reqErr">{reqErr}</span>}
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
            disabled={!imgSelected || status !== 'idle'}
          />
        </div>
      </form>
    </div>
  );
};

export default ProfilePictureForm;
