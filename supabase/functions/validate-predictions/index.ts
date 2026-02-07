// Supabase Edge Function: validate-predictions
// Fetches actual prices for past predictions and updates accuracy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fetch actual price for a specific date from AlphaVantage
async function fetchActualPrice(ticker: string, date: string, apiKey: string): Promise<number | null> {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=compact&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data["Error Message"] || data["Note"]) {
      console.error("AlphaVantage error for", ticker);
      return null;
    }
    
    const timeSeries = data["Time Series (Daily)"];
    if (!timeSeries) return null;
    
    // Try to find exact date or closest trading day
    const targetDate = new Date(date);
    for (let i = 0; i <= 5; i++) {
      const checkDate = new Date(targetDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      
      if (timeSeries[dateStr]) {
        return parseFloat(timeSeries[dateStr]["4. close"]);
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching price for", ticker, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const alphavantageKey = Deno.env.get("ALPHAVANTAGE_API_KEY");
    
    if (!alphavantageKey) {
      throw new Error("ALPHAVANTAGE_API_KEY not configured");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get predictions that need validation
    const today = new Date().toISOString().split("T")[0];
    const { data: predictions, error: fetchError } = await supabase
      .from("stock_predictions")
      .select("*")
      .lte("target_date", today)
      .is("actual_price", null)
      .limit(50); // Process in batches to avoid rate limits
    
    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }
    
    if (!predictions || predictions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No predictions to validate", validated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    let validated = 0;
    let errors = 0;
    
    // Process each prediction (with delays to respect rate limits)
    for (const prediction of predictions) {
      // AlphaVantage rate limit: 5 calls/min on free tier
      // Add delay between requests
      if (validated > 0 && validated % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 1 min every 5 calls
      }
      
      const actualPrice = await fetchActualPrice(
        prediction.ticker,
        prediction.target_date,
        alphavantageKey
      );
      
      if (actualPrice !== null) {
        // Check if prediction was within bounds (accurate)
        const isAccurate = 
          actualPrice >= prediction.lower_bound && 
          actualPrice <= prediction.upper_bound;
        
        const { error: updateError } = await supabase
          .from("stock_predictions")
          .update({
            actual_price: actualPrice,
            is_accurate: isAccurate,
          })
          .eq("id", prediction.id);
        
        if (updateError) {
          errors++;
          console.error("Update error:", updateError);
        } else {
          validated++;
        }
      } else {
        errors++;
      }
      
      // Small delay between all requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    
    return new Response(
      JSON.stringify({
        message: "Validation complete",
        validated,
        errors,
        total_checked: predictions.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
