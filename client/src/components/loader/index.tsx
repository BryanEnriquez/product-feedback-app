import style from './loader.module.scss';

type Props = {
  type?: 'a';
};

const Loader = ({ type = 'a' }: Props) => (
  <div className={`${style.loader} ${style[`loader--${type}`]}`} />
);
export default Loader;
