import '../css/Card.scss';

const Card = ({ children, label, color = 'orange' }) => (
  <div className={`card card--${color}`}>
    <span>{label}</span>
    {children}
  </div>
);

export default Card;
