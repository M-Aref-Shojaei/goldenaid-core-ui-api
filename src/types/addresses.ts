export interface Address {
  id: number;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  postalCode: string;
  line: string;
  isDefault: boolean;
  title: string;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  postal_code: string;
  is_default: boolean;
  notes: string;
  unit_number: string;
}

export interface CreateAddressPayload {
  title: string;
  recipient_name: string;
  recipient_phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  notes?: string;
  unit_number?: string;
  is_default?: boolean;
}
