import { TextField } from "./TextField";
import { CheckboxField } from "./CheckboxField";

/** Shape of the address form managed by {@link AddressFields}. */
export interface AddressFormData {
  label: string;
  recipient_name: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
  is_default: boolean;
}

/** Props for the {@link AddressFields} component. */
interface AddressFieldsProps {
  form: AddressFormData;
  errors: Partial<Record<keyof AddressFormData, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Visual theme — `dark` (default, admin/dashboard forms) or `light` (storefront forms). */
  theme?: "dark" | "light";
}

/** Renders all address form fields bound to {@link AddressFormData}. */
export function AddressFields({ form, errors, onChange, theme = "dark" }: AddressFieldsProps) {
  return (
    <div className="space-y-4">
      <TextField label="برچسب آدرس" name="label" value={form.label} onChange={onChange} error={errors.label} placeholder="مثلاً: خانه، محل کار" required theme={theme} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="نام گیرنده" name="recipient_name" value={form.recipient_name} onChange={onChange} error={errors.recipient_name} required theme={theme} />
        <TextField label="شماره تماس" name="phone" value={form.phone} onChange={onChange} error={errors.phone} type="tel" required theme={theme} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextField label="استان" name="province" value={form.province} onChange={onChange} error={errors.province} required theme={theme} />
        <TextField label="شهر" name="city" value={form.city} onChange={onChange} error={errors.city} required theme={theme} />
      </div>
      <TextField label="آدرس کامل" name="address" value={form.address} onChange={onChange} error={errors.address} required theme={theme} />
      <TextField label="کد پستی" name="postal_code" value={form.postal_code} onChange={onChange} error={errors.postal_code} maxLength={10} mono theme={theme} />
      <CheckboxField label="آدرس پیش‌فرض" name="is_default" checked={form.is_default} onChange={onChange} theme={theme} />
    </div>
  );
}
