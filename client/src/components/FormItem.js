function FormItem({
  id,
  label,
  desc,
  val,
  setVal,
  err,
  disabled = false,
  type = 'text',
}) {
  return (
    <div className="form__item">
      <label htmlFor={id}>{label}</label>
      <p>{desc}</p>
      <input
        className={`form__input${err ? ' form__input--err' : ''}`}
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        id={id}
        disabled={disabled}
      />
      <span className="form__err">{err}</span>
    </div>
  );
}

export default FormItem;
