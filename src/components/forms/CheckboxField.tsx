/** Props for the {@link CheckboxField} component. */
interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Dark-themed labeled checkbox for admin/dashboard forms. */
export function CheckboxField({ label, name, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox" name={name} id={name} checked={checked} onChange={onChange}
        className="w-5 h-5 text-gold bg-gray-800 border-gray-700 rounded focus:ring-gold"
      />
      <label htmlFor={name} className="text-gray-300">{label}</label>
    </div>
  );
}
