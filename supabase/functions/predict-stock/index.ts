// @ts-nocheck
// Supabase Edge Function: predict-stock
// Trains MLR model and returns stock price prediction

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Matrix, inverse } from "https://esm.sh/ml-matrix@6.10.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ridge Regression Implementation
class RidgeRegression {
  private weights: Matrix;
  private lambda: number;

  constructor(X: number[][], y: number[][], lambda: number = 1.0) {
    this.lambda = lambda;
    this.weights = this.train(new Matrix(X), new Matrix(y));
  }

  private train(X: Matrix, y: Matrix): Matrix {
    const nFeatures = X.columns;
    const identity = Matrix.eye(nFeatures, nFeatures);
    
    // beta = (X'X + lambda*I)^-1 * X'y
    const Xt = X.transpose();
    const XtX = Xt.mmul(X);
    const penalty = identity.mul(this.lambda);
    const term1 = inverse(XtX.add(penalty));
    const term2 = Xt.mmul(y);
    
    return term1.mmul(term2);
  }

  public predict(features: number[]): number {
    const x = new Matrix([features]);
    return x.mmul(this.weights).get(0, 0);
  }

  public getCoefficients(): number[] {
    return this.weights.to1DArray();
  }
}

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

// Calculate Log Returns (Momentum)
function calculateLogReturn(prices: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(null);
    } else {
      result.push(Math.log(prices[i] / prices[i - period]));
    }
  }
  return result;
}

// Calculate Rolling Z-Score
function calculateRollingZScore(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const window = data.slice(i - period + 1, i + 1);
      const mean = window.reduce((a, b) => a + b, 0) / period;
      const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const std = Math.sqrt(variance) || 1; // Avoid divide by zero
      result.push((data[i] - mean) / std);
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

// Z-score Normalization (Updated signature)
function normalizeData(data: number[][]): { normalized: number[][], means: number[], stds: number[] } {
  const numFeatures = data[0].length;
  const means: number[] = new Array(numFeatures).fill(0);
  const stds: number[] = new Array(numFeatures).fill(0);
  const normalized: number[][] = [];

  // Calculate means
  for (const row of data) {
    row.forEach((val, i) => means[i] += val);
  }
  means.forEach((sum, i) => means[i] = sum / data.length);

  // Calculate stds
  for (const row of data) {
    row.forEach((val, i) => stds[i] += Math.pow(val - means[i], 2));
  }
  stds.forEach((sum, i) => stds[i] = Math.sqrt(sum / data.length) || 1); // Avoid div by zero

  // Normalize
  for (const row of data) {
    normalized.push(row.map((val, i) => (val - means[i]) / stds[i]));
  }

  return { normalized, means, stds };
}

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

// Fetch historical macro data from FRED
async function fetchMacroData(apiKey: string) {
  try {
    // Fetch last 2 years of observations
    const today = new Date();
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(today.getFullYear() - 2);
    const startDate = twoYearsAgo.toISOString().split('T')[0];

    const [fedFundsRes, cpiRes] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${apiKey}&file_type=json&sort_order=desc&observation_start=${startDate}`),
      fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=${apiKey}&file_type=json&sort_order=desc&observation_start=${startDate}`),
    ]);
    
    const fedFundsData = await fedFundsRes.json();
    const cpiData = await cpiRes.json();
    
    // Helper to process FRED observations into a map { date: value }
    const processObservations = (data: any) => {
      const map = new Map<string, number>();
      if (data.observations) {
        data.observations.forEach((obs: any) => {
          map.set(obs.date, parseFloat(obs.value));
        });
      }
      return map;
    };

    return {
      fedFunds: processObservations(fedFundsData),
      cpi: processObservations(cpiData),
    };
  } catch {
    console.error("Error fetching macro data, using empty maps");
    return { fedFunds: new Map<string, number>(), cpi: new Map<string, number>() };
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
    
    if (stockData.length < 200) { // Need more history for 60d Z-score
      throw new Error("Insufficient historical data");
    }
    
    // Calculate indicators
    const closes = stockData.map((d) => d.close);
    const volumes = stockData.map((d) => d.volume);
    
    const sma20 = calculateSMA(closes, 20);
    const volatility = calculateVolatility(closes, 20);
    const logReturn5d = calculateLogReturn(closes, 5);
    const logReturn10d = calculateLogReturn(closes, 10);
    const volumeZScore60d = calculateRollingZScore(volumes, 60);
    
    // Helper to get latest macro value before a date
    const getMacroValue = (map: Map<string, number>, dateStr: string) => {
      // Crude but effective for small datasets (24 months): iterate and find latest
      let latestVal = null;
      let latestDate = "";
      for (const [d, v] of map.entries()) {
        if (d <= dateStr && d > latestDate) {
          latestDate = d;
          latestVal = v;
        }
      }
      return latestVal;
    };

    // Build processed data
    const processedData: any[] = [];
    // Start from 60 to ensure all indicators are available (Volume Z-Score needs 60)
    for (let i = 60; i < stockData.length; i++) {
      if (sma20[i] == null || volatility[i] == null || logReturn5d[i] == null || logReturn10d[i] == null || volumeZScore60d[i] == null) continue;
      
      const dateStr = stockData[i].date;
      const fedFunds = getMacroValue(macroData.fedFunds, dateStr);
      const cpi = getMacroValue(macroData.cpi, dateStr);

      // If macro data missing (e.g. very recent days before release), use last known
      // If no history at all, default (shouldn't happen with 2y fetch)
      
      processedData.push({
        close: closes[i],
        sma_20: sma20[i],
        volatility: volatility[i],
        log_return_5d: logReturn5d[i],
        log_return_10d: logReturn10d[i],
        volume_z_score_60d: volumeZScore60d[i],
        fed_funds: fedFunds || 4.5, // Fallback
        cpi: cpi || 300, // Fallback
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
      // Features: [Close, SMA_20, Volatility, LogRet5, LogRet10, VolZ60, FedFunds, CPI]
      X.push([
        row.close, 
        row.sma_20, 
        row.volatility, 
        row.log_return_5d, 
        row.log_return_10d, 
        row.volume_z_score_60d, 
        row.fed_funds, 
        row.cpi
      ]);
      y.push([processedData[i + daysAhead].close]);
    }
    
    // Normalize training data
    const { normalized: X_norm, means, stds } = normalizeData(X);

    // Center y (Target) for Ridge Regression (since we don't have an intercept)
    const meanY = y.reduce((a, b) => a + b[0], 0) / y.length;
    const y_centered = y.map(row => [row[0] - meanY]);

    // Train Ridge Regression model (Lambda = 1.0) on centered data
    const regression = new RidgeRegression(X_norm, y_centered, 1.0);
    
    // Get coefficients
    const coefficients = regression.getCoefficients(); 
    
    // Prepare latest data for prediction
    const latest = processedData[processedData.length - 1];
    const latestFeatures = [
      latest.close,
      latest.sma_20,
      latest.volatility,
      latest.log_return_5d,
      latest.log_return_10d,
      latest.volume_z_score_60d,
      latest.fed_funds,
      latest.cpi
    ];
    
    // Normalize latest features
    const latestFeaturesNorm = latestFeatures.map((val, i) => (val - means[i]) / stds[i]);
    
    // Predict (add meanY back)
    let raw_prediction = regression.predict(latestFeaturesNorm);
    let prediction = raw_prediction + meanY;
    
    // Apply dynamic clamping (2-sigma rule)
    const { lower, upper } = calculateBounds(latest.close, latest.volatility, daysAhead);
    prediction = Math.max(lower, Math.min(prediction, upper));
    
    // --- Metrics Calculation ---

    // 1. Feature Importance (Sum-Normalized)
    const absWeights = coefficients.map((w: number) => Math.abs(w));
    const totalWeight = absWeights.reduce((a: number, b: number) => a + b, 0);
    const featureNames = ["Price", "SMA (20d)", "Volatility", "Momentum (5d)", "Momentum (10d)", "Vol Z-Score", "Fed Funds", "CPI"];
    const featureImportance: Record<string, number> = {};
    featureNames.forEach((name, i) => {
      featureImportance[name] = (absWeights[i] / totalWeight) * 100;
    });

    // 2. R-Squared (In-Sample Fit)
    // Compare actual y vs (predicted_centered + meanY)
    let ssRes = 0, ssTot = 0;
    X_norm.forEach((x, i) => {
      const pred_centered = regression.predict(x);
      const pred_actual = pred_centered + meanY;
      ssRes += Math.pow(pred_actual - y[i][0], 2);
      ssTot += Math.pow(y[i][0] - meanY, 2);
    });
    const rSquared = Math.max(0, 1 - ssRes / ssTot);

    // 3. Historical Hit Rate (Directional Accuracy)
    let correctDirection = 0;
    let totalSamples = 0;
    
    X_norm.forEach((x, i) => {
      const pred_centered = regression.predict(x);
      const predPrice = pred_centered + meanY;
      const actualPrice = y[i][0];
      const currentPriceAtT = X[i][0]; // Original Close price is at index 0
      
      const predictedDirection = Math.sign(predPrice - currentPriceAtT);
      const actualDirection = Math.sign(actualPrice - currentPriceAtT);
      
      if (predictedDirection === actualDirection) {
        correctDirection++;
      }
      totalSamples++;
    });
    const hitRate = totalSamples > 0 ? (correctDirection / totalSamples) : 0;
    
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
        ...latest,
        r_squared: rSquared,
        hit_rate: hitRate,
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
        hit_rate: Math.round(hitRate * 1000) / 1000,
        training_samples: X.length,
        volatility: Math.round(latest.volatility * 10000) / 10000,
        feature_importance: featureImportance,
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
