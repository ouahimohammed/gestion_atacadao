// lib/storage.ts
export interface Reception {
  id: string;
  product_name: string;
  pallet_number: string | null;
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

// Simuler une base de données avec localStorage
export const storage = {
  getReceptions: (): Reception[] => {
    try {
      const stored = localStorage.getItem('warehouse-receptions');
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error reading receptions:', error);
      return [];
    }
  },

  addReception: (receptionData: Omit<Reception, 'id'>): void => {
    try {
      const receptions = storage.getReceptions();
      const newReception: Reception = {
        ...receptionData,
        id: Math.random().toString(36).substring(2, 11),
      };
      receptions.push(newReception);
      localStorage.setItem('warehouse-receptions', JSON.stringify(receptions));
    } catch (error) {
      console.error('Error adding reception:', error);
      throw new Error('Failed to add reception');
    }
  },

  deleteReception: (id: string): void => {
    try {
      const receptions = storage.getReceptions();
      const filtered = receptions.filter(reception => reception.id !== id);
      localStorage.setItem('warehouse-receptions', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting reception:', error);
      throw new Error('Failed to delete reception');
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
      throw new Error('Failed to update reception');
    }
  }
};