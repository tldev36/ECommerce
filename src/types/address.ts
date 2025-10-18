export interface Address {
  id?: number; // cho phép undefined khi thêm mới
  recipient_name: string;
  phone: string;
  detail_address: string;           // số nhà, tên đường...
  province_district_ward: string;   // tỉnh / huyện / xã
  default?: boolean; 
}
