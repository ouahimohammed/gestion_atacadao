export type Reception = {
  id: string;
  product_name: string;
  pallet_number: string;
  cartons: number;
  units_per_carton: number;
  total_units: number;
  barcode: string;
  production_date: string;
  expiration_date: string;
  shelf_life_months: number;
  status: string;
  created_at: string;
};

const STORAGE_KEY = 'warehouse_receptions';

export const storage = {
  getReceptions: (): Reception[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  addReception: (reception: Reception): void => {
    const receptions = storage.getReceptions();
    receptions.push(reception);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receptions));
  },

  deleteReception: (id: string): void => {
    const receptions = storage.getReceptions();
    const filtered = receptions.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};
