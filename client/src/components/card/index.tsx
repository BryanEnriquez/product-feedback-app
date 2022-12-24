import style from './card.module.scss';

type Props = {
  children?: React.ReactNode;
  label: string;
  color?: 'orange' | 'violet' | 'blue';
};

const Card = ({ children, label, color = 'orange' }: Props) => (
  <div className={`${style.card} ${style[`card--${color}`]}`}>
    <span>{label}</span>
    {children}
  </div>
);

export default Card;
