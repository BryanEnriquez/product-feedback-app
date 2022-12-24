interface InputProps {
  id: string;
  label: string;
  desc: string;
  err?: string | null;
  disabled?: boolean;
  type?: 'text' | 'password';
  autoComplete?: string;
  hidden?: boolean;
}

interface UncontrolledInput extends InputProps {
  value?: undefined;
  onChange?: undefined;
}

interface ControlledInput extends InputProps {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

type Props = UncontrolledInput | ControlledInput;

const FormItem = ({
  id,
  label,
  desc,
  value,
  onChange,
  err,
  disabled = false,
  type = 'text',
  autoComplete,
  hidden = false,
}: Props) => {
  return (
    <div className="form__item">
      <label htmlFor={id}>{label}</label>
      <p>{desc}</p>
      <input
        className={`form__input${err ? ' form__input--err' : ''}`}
        type={type}
        id={id}
        name={id}
        {...(onChange && { value, onChange: (e) => onChange(e.target.value) })}
        disabled={disabled}
        autoComplete={autoComplete}
        hidden={hidden}
      />
      <span className="form__err">{err}</span>
    </div>
  );
};

export default FormItem;
