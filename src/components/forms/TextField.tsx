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

export function TextField({
  label, name, value, onChange, error,
  required = false, placeholder, type = "text", maxLength, mono, helper,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength}
        className={`w-full px-4 py-3 bg-gray-800 border ${error ? "border-red-500" : "border-gray-700"} rounded-lg text-white focus:outline-none focus:border-gold${mono ? " font-mono" : ""}`}
      />
      {helper && <p className="text-gray-500 text-sm mt-1">{helper}</p>}
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
