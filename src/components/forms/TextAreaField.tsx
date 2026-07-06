/** Props for the {@link TextAreaField} component. */
interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

/** Dark-themed labeled textarea for admin/dashboard forms. */
export function TextAreaField({
  label, name, value, onChange, error, required = false, placeholder, rows = 3,
}: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        {label} {required && <span className="text-semantic-red-light">*</span>}
      </label>
      <textarea
        name={name} value={value} onChange={onChange}
        placeholder={placeholder} rows={rows}
        className={`w-full px-4 py-3 bg-dark-secondary border ${error ? "border-error" : "border-dark-card"} rounded-lg text-white focus:outline-none focus:border-gold resize-none`}
      />
      {error && <p className="text-semantic-red-light text-sm mt-1">{error}</p>}
    </div>
  );
}
