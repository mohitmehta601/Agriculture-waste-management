
import { supabase } from '@/integrations/supabase/client';

export interface FarmerSubmission {
  id?: string;
  farmer_name: string;
  mobile_number: string;
  land_area_acres: number;
  crop_grown: string;
  crop_yield_per_acre: number;
  crop_field_location_lat?: number;
  crop_field_location_lon?: number;
  crop_field_address?: string;
  waste_type: string;
  harvest_date: string;
  image_url?: string;
  calculated_waste_tons?: number;
  estimated_market_value_inr?: number;
  carbon_footprint_kg_co2e?: number;
  chosen_action?: string;
  ai_recommendations?: string[];
  pickup_status?: string;
  pickup_scheduled_date?: string;
}

export interface MarketplaceProduct {
  id?: string;
  crop_residue_type: string;
  total_stock_kg: number;
  price_per_kg: number;
  image_url?: string;
  is_available?: boolean;
}

export const databaseService = {
  // Submit farmer data and return submission ID
  async submitFarmerData(data: FarmerSubmission): Promise<string> {
    const { data: result, error } = await supabase
      .from('farmers_submissions')
      .insert([data])
      .select('id')
      .single();

    if (error) {
      console.error('Error submitting farmer data:', error);
      throw error;
    }

    return result.id;
  },

  // Update farmer submission after action choice
  async updateFarmerSubmission(id: string, updates: Partial<FarmerSubmission>) {
    const { error } = await supabase
      .from('farmers_submissions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating farmer submission:', error);
      throw error;
    }
  },

  // Get farmer submission by ID
  async getFarmerSubmission(id: string) {
    const { data, error } = await supabase
      .from('farmers_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching farmer submission:', error);
      throw error;
    }

    return data;
  },

  // Add waste to marketplace (aggregate quantities)
  async addWasteToMarketplace(cropResidueType: string, quantityKg: number) {
    // First try to update existing product
    const { data: existingProduct, error: fetchError } = await supabase
      .from('marketplace_products')
      .select('total_stock_kg')
      .eq('crop_residue_type', cropResidueType)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching marketplace product:', fetchError);
      throw fetchError;
    }

    if (existingProduct) {
      // Update existing product quantity
      const { error } = await supabase
        .from('marketplace_products')
        .update({ 
          total_stock_kg: existingProduct.total_stock_kg + quantityKg,
          is_available: true 
        })
        .eq('crop_residue_type', cropResidueType);

      if (error) {
        console.error('Error updating marketplace product:', error);
        throw error;
      }
    }
  },

  // Get all marketplace products
  async getMarketplaceProducts(): Promise<MarketplaceProduct[]> {
    const { data, error } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('is_available', true)
      .gt('total_stock_kg', 0);

    if (error) {
      console.error('Error fetching marketplace products:', error);
      throw error;
    }

    return data || [];
  },

  // Schedule pickup
  async schedulePickup(submissionId: string, pickupDate: string) {
    const { error } = await supabase
      .from('farmers_submissions')
      .update({ 
        pickup_status: 'Scheduled',
        pickup_scheduled_date: pickupDate
      })
      .eq('id', submissionId);

    if (error) {
      console.error('Error scheduling pickup:', error);
      throw error;
    }
  }
};
