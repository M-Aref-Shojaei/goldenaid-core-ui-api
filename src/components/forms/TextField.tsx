/** Props for the {@link TextField} component. */
interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  maxLength?: number;
  mono?: boolean;
  helper?: string;
}

/** Dark-themed labeled text input for admin/dashboard forms. */
export function TextField({
  label, name, value, onChange, error,
  required = false, placeholder, type = "text", maxLength, mono, helper,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        {label} {required && <span className="text-semantic-red-light">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength}
        className={`w-full px-4 py-3 bg-dark-secondary border ${error ? "border-error" : "border-dark-card"} rounded-lg text-white focus:outline-none focus:border-gold${mono ? " font-mono" : ""}`}
      />
      {helper && <p className="text-neutral-500 text-sm mt-1">{helper}</p>}
      {error && <p className="text-semantic-red-light text-sm mt-1">{error}</p>}
    </div>
  );
}
