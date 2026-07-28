/** Props for the {@link CheckboxField} component. */
interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Visual theme — `dark` (default, admin/dashboard forms) or `light` (storefront forms). */
  theme?: "dark" | "light";
}

/** Labeled checkbox for admin/dashboard/storefront forms; dark-themed by default. */
export function CheckboxField({ label, name, checked, onChange, theme = "dark" }: CheckboxFieldProps) {
  const isLight = theme === "light";
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox" name={name} id={name} checked={checked} onChange={onChange}
        className={`w-5 h-5 text-gold rounded focus:ring-gold ${isLight ? "bg-white border-neutral-100" : "bg-dark-secondary border-dark-card"}`}
      />
      <label htmlFor={name} className={isLight ? "text-dark" : "text-neutral-300"}>{label}</label>
    </div>
  );
}
