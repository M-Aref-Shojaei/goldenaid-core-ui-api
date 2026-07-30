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
  /** Visual theme — `dark` (default, admin/dashboard forms) or `light` (storefront forms). */
  theme?: "dark" | "light";
}

/** Labeled text input for admin/dashboard/storefront forms; dark-themed by default. */
export function TextField({
  label, name, value, onChange, error,
  required = false, placeholder, type = "text", maxLength, mono, helper, theme = "dark",
}: TextFieldProps) {
  const isLight = theme === "light";
  return (
    <div>
      <label htmlFor={name} className={`block text-sm font-medium mb-2 ${isLight ? "text-dark" : "text-neutral-300"}`}>
        {label} {required && <span className="text-semantic-red-light">*</span>}
      </label>
      <input
        id={name} type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength}
        className={
          isLight
            ? `w-full px-4 py-3 bg-white border ${error ? "border-error" : "border-neutral-100"} rounded-lg text-dark focus:outline-none focus:border-gold${mono ? " font-mono" : ""}`
            : `w-full px-4 py-3 bg-dark-secondary border ${error ? "border-error" : "border-dark-card"} rounded-lg text-white focus:outline-none focus:border-gold${mono ? " font-mono" : ""}`
        }
      />
      {helper && <p className={`text-sm mt-1 ${isLight ? "text-neutral-400" : "text-neutral-500"}`}>{helper}</p>}
      {error && <p className="text-semantic-red-light text-sm mt-1">{error}</p>}
    </div>
  );
}
