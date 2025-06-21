
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    console.log('Processing stock update for order:', orderId);

    // Get order items
    const { data: orderItems, error: orderError } = await supabase
      .from('order_items')
      .select('marketplace_product_id, quantity_kg')
      .eq('order_id', orderId);

    if (orderError) {
      throw new Error(`Failed to fetch order items: ${orderError.message}`);
    }

    if (!orderItems || orderItems.length === 0) {
      throw new Error('No order items found');
    }

    // Update stock for each product
    for (const item of orderItems) {
      if (item.marketplace_product_id) {
        console.log(`Updating stock for product ${item.marketplace_product_id}, reducing by ${item.quantity_kg}`);
        
        // Get current stock
        const { data: product, error: productError } = await supabase
          .from('marketplace_products')
          .select('total_stock_kg')
          .eq('id', item.marketplace_product_id)
          .single();

        if (productError) {
          console.error(`Error fetching product ${item.marketplace_product_id}:`, productError);
          continue;
        }

        const newStock = Math.max(0, product.total_stock_kg - item.quantity_kg);
        
        // Update stock
        const { error: updateError } = await supabase
          .from('marketplace_products')
          .update({ 
            total_stock_kg: newStock,
            is_available: newStock > 0
          })
          .eq('id', item.marketplace_product_id);

        if (updateError) {
          console.error(`Error updating stock for product ${item.marketplace_product_id}:`, updateError);
        } else {
          console.log(`Successfully updated stock for product ${item.marketplace_product_id}. New stock: ${newStock}`);
        }
      }
    }

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({ order_status: 'Processing' })
      .eq('id', orderId);

    if (orderUpdateError) {
      console.error('Error updating order status:', orderUpdateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Stock updated successfully',
      orderId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-stock-after-purchase function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
