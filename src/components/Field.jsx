import { forwardRef } from 'react';

// Works with react-hook-form's register(): <Field label="Email" error={errors.email?.message} {...register('email')} />
const Field = forwardRef(function Field({ label, error, as: Tag = 'input', ...rest }, ref) {
  return (
    <label className="block">
      {label && <span className="text-sm font-semibold">{label}</span>}
      <Tag ref={ref} className={`input ${label ? 'mt-1' : ''} ${error ? '!border-red-400' : ''}`} {...rest} />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
});
export default Field;
