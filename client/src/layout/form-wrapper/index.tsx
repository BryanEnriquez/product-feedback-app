import BackLink from '../../components/back-link';
import style from './wrapper.module.scss';

export type FormWrapperIcon = 'create' | 'edit' | 'signup';

type Props = {
  children?: React.ReactNode;
  title: string;
  icon: FormWrapperIcon;
};

const FormWrapper = ({ children, title, icon }: Props) => (
  <div className={style.formWrapper}>
    <div className={style.formWrapper__backLink}>
      <BackLink />
    </div>
    <div className={style.formWrapper__main}>
      <i className={style[`icon--${icon}`]} />
      <h1>{title}</h1>
      {children}
    </div>
  </div>
);

export default FormWrapper;
