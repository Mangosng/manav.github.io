// @ts-nocheck
// Supabase Edge Function: predict-stock
// Trains MLR model and returns stock price prediction

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import MLR from "https://esm.sh/ml-regression-multivariate-linear@2.0.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Format ticker for market
function formatTicker(ticker: string, market: string): string {
  const clean = ticker.toUpperCase().trim();
  if (market === "TSX") {
    return clean.endsWith(".TO") ? clean : `${clean}.TO`;
  }
  return clean;
}

// Calculate Simple Moving Average
function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

// Calculate Volatility (Std Dev of Log Returns)
function calculateVolatility(prices: number[], period: number = 20): (number | null)[] {
  const result: (number | null)[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(null);
    } else {
      const returns: number[] = [];
      for (let j = i - period + 1; j <= i; j++) {
        const logReturn = Math.log(prices[j] / prices[j - 1]);
        returns.push(logReturn);
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      result.push(Math.sqrt(variance));
    }
  }
  return result;
}

// Calculate 95% Confidence Interval bounds
function calculateBounds(currentPrice: number, dailyVol: number, daysAhead: number) {
  const sigma = dailyVol * Math.sqrt(daysAhead);
  return {
    lower: currentPrice * (1 - 2 * sigma),
    upper: currentPrice * (1 + 2 * sigma),
  };
}

// Fetch stock data from AlphaVantage
// Fetch stock data from Polygon.io
async function fetchStockData(ticker: string, apiKey: string) {
  // Calculate date range (2 years ago to today)
  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  
  const fromDate = twoYearsAgo.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];
  
  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== "OK" && data.status !== "ok" && data.status !== "DELAYED") {
    throw new Error(`Polygon error: ${data.error || data.status}`);
  }
  
  if (!data.results || data.results.length === 0) {
    throw new Error("No data returned from Polygon");
  }
  
  // Map Polygon results to our format
  return data.results.map((d: any) => ({
    date: new Date(d.t).toISOString().split('T')[0],
    open: d.o,
    high: d.h,
    low: d.l,
    close: d.c,
    volume: d.v,
  }));
}

// Fetch macro data from FRED
async function fetchMacroData(apiKey: string) {
  try {
    const [fedFundsRes, cpiRes] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`),
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`),
    ]);
    
    const fedFundsData = await fedFundsRes.json();
    const cpiData = await cpiRes.json();
    
    return {
      fedFunds: parseFloat(fedFundsData.observations?.[0]?.value) || 4.5,
      cpi: parseFloat(cpiData.observations?.[0]?.value) || 300,
    };
  } catch {
    return { fedFunds: 4.5, cpi: 300 };
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { ticker, market, target_date } = await req.json();
    
    if (!ticker || !market || !target_date) {
      throw new Error("Missing required fields: ticker, market, target_date");
    }
    
    const formattedTicker = formatTicker(ticker, market);
    const targetDate = new Date(target_date);
    const today = new Date();
    const daysAhead = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAhead <= 0) {
      throw new Error("Target date must be in the future");
    }
    
    // Get API keys from environment
    // Get API keys from environment
    const polygonKey = Deno.env.get("POLYGON_API_KEY");
    const fredKey = Deno.env.get("FRED_API_KEY");
    
    if (!polygonKey) {
      throw new Error("POLYGON_API_KEY not configured");
    }
    
    // Fetch data
    const [stockData, macroData] = await Promise.all([
      fetchStockData(formattedTicker, polygonKey),
      fetchMacroData(fredKey || ""),
    ]);
    
    if (stockData.length < 100) {
      throw new Error("Insufficient historical data");
    }
    
    // Calculate indicators
    const closes = stockData.map((d) => d.close);
    const volumes = stockData.map((d) => d.volume);
    const sma20 = calculateSMA(closes, 20);
    const volatility = calculateVolatility(closes, 20);
    const volumeSMA = calculateSMA(volumes, 20);
    
    // Build processed data
    const processedData: any[] = [];
    for (let i = 20; i < stockData.length; i++) {
      if (sma20[i] == null || volatility[i] == null) continue;
      
      processedData.push({
        close: closes[i],
        volume: volumes[i] / (volumeSMA[i] || 1),
        sma_20: sma20[i],
        volatility: volatility[i],
        fed_funds: macroData.fedFunds,
        cpi: macroData.cpi,
      });
    }
    
    if (processedData.length < daysAhead + 30) {
      throw new Error("Insufficient data for prediction horizon");
    }
    
    // Prepare training data
    const X: number[][] = [];
    const y: number[][] = [];
    
    for (let i = 0; i < processedData.length - daysAhead; i++) {
      const row = processedData[i];
      X.push([row.close, row.volume, row.sma_20, row.volatility, row.fed_funds, row.cpi]);
      y.push([processedData[i + daysAhead].close]);
    }
    
    // Train MLR model
    const regression = new MLR(X, y);
    
    // Predict using latest data
    const latest = processedData[processedData.length - 1];
    const latestFeatures = [latest.close, latest.volume, latest.sma_20, latest.volatility, latest.fed_funds, latest.cpi];
    
    let prediction = regression.predict(latestFeatures)[0];
    
    // Apply dynamic clamping (2-sigma rule)
    const { lower, upper } = calculateBounds(latest.close, latest.volatility, daysAhead);
    prediction = Math.max(lower, Math.min(prediction, upper));
    
    // Calculate R² on training data
    let ssRes = 0, ssTot = 0;
    const meanY = y.reduce((a, b) => a + b[0], 0) / y.length;
    X.forEach((x, i) => {
      const pred = regression.predict(x)[0];
      ssRes += Math.pow(pred - y[i][0], 2);
      ssTot += Math.pow(y[i][0] - meanY, 2);
    });
    const rSquared = Math.max(0, 1 - ssRes / ssTot);
    
    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error: dbError } = await supabase.from("stock_predictions").insert({
      ticker: formattedTicker,
      market,
      target_date,
      predicted_price: prediction,
      lower_bound: lower,
      upper_bound: upper,
      input_features: {
        close: latest.close,
        volume: latest.volume,
        sma_20: latest.sma_20,
        volatility: latest.volatility,
        fed_funds: latest.fed_funds,
        cpi: latest.cpi,
        r_squared: rSquared,
        training_samples: X.length,
      },
    });
    
    if (dbError) {
      console.error("Database error:", dbError);
    }
    
    return new Response(
      JSON.stringify({
        ticker: formattedTicker,
        market,
        target_date,
        days_ahead: daysAhead,
        current_price: latest.close,
        predicted_price: Math.round(prediction * 100) / 100,
        lower_bound: Math.round(lower * 100) / 100,
        upper_bound: Math.round(upper * 100) / 100,
        currency: market === "TSX" ? "CAD" : "USD",
        r_squared: Math.round(rSquared * 1000) / 1000,
        training_samples: X.length,
        volatility: Math.round(latest.volatility * 10000) / 10000,
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
