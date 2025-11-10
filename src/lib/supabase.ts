// lib/supabase.ts
export interface Reception {
  id: string;
  product_name: string;
  pallet_number: string | null; // Correction: accepter null
  cartons: number;
  units_per_carton: number;
  total_units: number;
  barcode: string;
  production_date: string;
  expiration_date: string;
  shelf_life_months: number;
  status: string;
  created_at: string;
}

export const storage = {
  getReceptions: (): Reception[] => {
    try {
      const stored = localStorage.getItem('warehouse-receptions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading receptions:', error);
      return [];
    }
  },

  addReception: (reception: Reception): void => {
    try {
      const receptions = storage.getReceptions();
      receptions.push(reception);
      localStorage.setItem('warehouse-receptions', JSON.stringify(receptions));
    } catch (error) {
      console.error('Error adding reception:', error);
    }
  },

  deleteReception: (id: string): void => {
    try {
      const receptions = storage.getReceptions();
      const filtered = receptions.filter(reception => reception.id !== id);
      localStorage.setItem('warehouse-receptions', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting reception:', error);
    }
  },

  updateReception: (id: string, updates: Partial<Reception>): void => {
    try {
      const receptions = storage.getReceptions();
      const updated = receptions.map(reception =>
        reception.id === id ? { ...reception, ...updates } : reception
      );
      localStorage.setItem('warehouse-receptions', JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating reception:', error);
    }
  }
};