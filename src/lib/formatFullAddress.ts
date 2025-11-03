// src/utils/formatFullAddress.ts

interface AddressParts {
  ward_name?: string | null;
  district_name?: string | null;
  province_name?: string | null;
}

export function formatFullAddress(address: AddressParts): string {
  return [
    address.ward_name?.trim(),
    address.district_name?.trim(),
    address.province_name?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
}
