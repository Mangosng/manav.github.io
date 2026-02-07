// Multiple Linear Regression implementation for stock prediction
import MLR from 'ml-regression-multivariate-linear';

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(data, period) {
  const result = [];
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

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(prices, period = 14) {
  const result = [];
  const gains = [];
  const losses = [];
  
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  result.push(null); // First value has no RSI
  
  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - (100 / (1 + rs)));
      }
    }
  }
  
  return result;
}

/**
 * Calculate Average True Range (ATR)
 */
function calculateATR(high, low, close, period = 14) {
  const trueRanges = [];
  
  for (let i = 0; i < high.length; i++) {
    if (i === 0) {
      trueRanges.push(high[i] - low[i]);
    } else {
      const tr = Math.max(
        high[i] - low[i],
        Math.abs(high[i] - close[i - 1]),
        Math.abs(low[i] - close[i - 1])
      );
      trueRanges.push(tr);
    }
  }
  
  return calculateSMA(trueRanges, period);
}

/**
 * Prepare features from historical data
 */
export function engineerFeatures(history, macroData = {}) {
  const closes = history.map(d => d.close);
  const highs = history.map(d => d.high);
  const lows = history.map(d => d.low);
  const volumes = history.map(d => d.volume);
  
  // Calculate technical indicators
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const rsi = calculateRSI(closes, 14);
  const atr = calculateATR(highs, lows, closes, 14);
  const volumeSMA = calculateSMA(volumes, 20);
  
  // Build feature matrix
  const features = [];
  const targets = [];
  const validIndices = [];
  
  // Start from index 50 to ensure all indicators are available
  for (let i = 50; i < history.length; i++) {
    if (sma20[i] == null || sma50[i] == null || rsi[i] == null || atr[i] == null) {
      continue;
    }
    
    const feature = [
      closes[i - 1],                          // Previous close (lag 1)
      sma20[i],                               // 20-day SMA
      sma50[i],                               // 50-day SMA
      rsi[i],                                 // RSI
      atr[i],                                 // ATR
      volumes[i] / (volumeSMA[i] || 1),       // Volume ratio
      macroData.fedFundsRate || 4.5,          // Fed Funds Rate
      macroData.cpi || 300,                   // CPI
    ];
    
    features.push(feature);
    targets.push([closes[i]]);
    validIndices.push(i);
  }
  
  return { features, targets, validIndices };
}

/**
 * Train MLR model and make prediction
 */
export function trainAndPredict(history, macroData, daysAhead = 1) {
  const { features, targets, validIndices } = engineerFeatures(history, macroData);
  
  if (features.length < 30) {
    throw new Error('Insufficient data for training (need at least 30 valid data points)');
  }
  
  // Split data: 80% train, 20% test
  const splitIndex = Math.floor(features.length * 0.8);
  const trainX = features.slice(0, splitIndex);
  const trainY = targets.slice(0, splitIndex);
  const testX = features.slice(splitIndex);
  const testY = targets.slice(splitIndex);
  
  // Train the model
  const model = new MLR(trainX, trainY);
  
  // Calculate metrics on test set
  let sumSquaredError = 0;
  let sumAbsoluteError = 0;
  let sumSquaredTotal = 0;
  const meanY = testY.reduce((a, b) => a + b[0], 0) / testY.length;
  
  testX.forEach((x, i) => {
    const predicted = model.predict(x)[0];
    const actual = testY[i][0];
    sumSquaredError += Math.pow(predicted - actual, 2);
    sumAbsoluteError += Math.abs(predicted - actual);
    sumSquaredTotal += Math.pow(actual - meanY, 2);
  });
  
  const rSquared = 1 - (sumSquaredError / sumSquaredTotal);
  const mae = sumAbsoluteError / testY.length;
  
  // Make prediction using latest data
  const latestFeatures = features[features.length - 1];
  let prediction = model.predict(latestFeatures)[0];
  
  // For multi-day predictions, apply simple adjustment
  // (In production, use recursive forecasting)
  if (daysAhead > 1) {
    const avgDailyChange = (history[history.length - 1].close - history[history.length - 20].close) / 20;
    prediction += avgDailyChange * (daysAhead - 1);
  }
  
  return {
    predictedPrice: prediction,
    rSquared: Math.max(0, Math.min(1, rSquared)),
    mae,
    trainingSize: trainX.length,
    testSize: testX.length,
    coefficients: model.weights,
  };
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
