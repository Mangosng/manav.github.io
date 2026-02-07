import { useState } from 'react';
import { fetchStockData, fetchMacroData, fetchCompanyInfo, formatTicker } from '../../lib/stockApi';
import { trainAndPredict, daysBetween } from '../../lib/mlr';
import PredictionChart from './PredictionChart';

const MARKETS = [
  { value: 'NASDAQ', label: 'NASDAQ' },
  { value: 'NYSE', label: 'NYSE' },
  { value: 'TSX', label: 'TSX (Toronto)' },
];

const StockPredictor = () => {
  const [ticker, setTicker] = useState('');
  const [market, setMarket] = useState('NASDAQ');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  const handlePredict = async () => {
    if (!ticker.trim()) {
      setError('Please enter a ticker symbol');
      return;
    }
    if (!targetDate) {
      setError('Please select a target date');
      return;
    }

    const today = new Date();
    const target = new Date(targetDate);
    if (target <= today) {
      setError('Target date must be in the future');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch all data in parallel
      const [stockResult, macroResult, infoResult] = await Promise.all([
        fetchStockData(ticker, market),
        fetchMacroData(),
        fetchCompanyInfo(ticker, market),
      ]);

      setStockData(stockResult);
      setCompanyInfo(infoResult);

      // Calculate days ahead
      const daysAhead = daysBetween(today, target);

      // Train model and predict
      const prediction = trainAndPredict(stockResult.history, macroResult, daysAhead);

      setResult({
        ...prediction,
        ticker: formatTicker(ticker, market),
        targetDate,
        daysAhead,
        currency: stockResult.currency,
        currentPrice: stockResult.history[stockResult.history.length - 1].close,
      });
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  // Get min date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get max date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <main className="flex-grow flex flex-col items-center justify-start py-16 px-6">
      <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-terminal text-center text-ink mb-4">
        [ STOCK PRICE PREDICTOR ]
      </h1>
      <p className="text-sm text-ink/70 text-center mb-8 max-w-xl">
        Multiple Linear Regression model using technical indicators (SMA, RSI, ATR) and macroeconomic data
      </p>

      <div className="w-full max-w-2xl">
        {/* Input Form */}
        <div className="border border-structure p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Ticker Input */}
            <div>
              <label className="block text-xs uppercase tracking-terminal text-ink/70 mb-2">
                TICKER SYMBOL
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. AAPL"
                className="w-full bg-canvas border border-structure p-3 text-sm font-mono uppercase"
              />
            </div>

            {/* Market Dropdown */}
            <div>
              <label className="block text-xs uppercase tracking-terminal text-ink/70 mb-2">
                MARKET
              </label>
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full bg-canvas border border-structure p-3 text-sm font-mono"
              >
                {MARKETS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs uppercase tracking-terminal text-ink/70 mb-2">
                TARGET DATE
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={minDate}
                max={maxDateStr}
                className="w-full bg-canvas border border-structure p-3 text-sm font-mono"
              />
            </div>
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-highlight text-invert p-4 text-sm uppercase tracking-terminal font-semibold hover:bg-ink transition-none disabled:opacity-50"
          >
            {loading ? '[ ANALYZING... ]' : '[ PREDICT PRICE ]'}
          </button>

          {/* Error Message */}
          {error && (
            <p className="mt-4 text-sm text-red-600 uppercase tracking-terminal text-center">
              [ {error} ]
            </p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="border border-structure p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-terminal">
                  {result.ticker}
                </h2>
                {companyInfo?.name && (
                  <p className="text-sm text-ink/70">{companyInfo.name}</p>
                )}
              </div>
              <span className="text-xs uppercase tracking-terminal text-ink/50">
                {result.currency}
              </span>
            </div>

            {/* Price Prediction */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-structure p-4">
                <p className="text-xs uppercase tracking-terminal text-ink/70 mb-1">
                  CURRENT PRICE
                </p>
                <p className="text-2xl font-bold">
                  ${result.currentPrice.toFixed(2)}
                </p>
              </div>
              <div className="border border-structure p-4 bg-highlight/10">
                <p className="text-xs uppercase tracking-terminal text-ink/70 mb-1">
                  PREDICTED ({result.daysAhead} DAYS)
                </p>
                <p className="text-2xl font-bold">
                  ${result.predictedPrice.toFixed(2)}
                </p>
                <p className={`text-xs ${result.predictedPrice >= result.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                  {result.predictedPrice >= result.currentPrice ? '▲' : '▼'} {' '}
                  {(((result.predictedPrice - result.currentPrice) / result.currentPrice) * 100).toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Model Metrics */}
            <div className="border-t border-dotted border-structure pt-4">
              <p className="text-xs uppercase tracking-terminal text-ink/70 mb-3">
                MODEL ACCURACY METRICS
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{(result.rSquared * 100).toFixed(1)}%</p>
                  <p className="text-xs text-ink/50">R² SCORE</p>
                </div>
                <div>
                  <p className="text-lg font-bold">${result.mae.toFixed(2)}</p>
                  <p className="text-xs text-ink/50">MAE</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{result.trainingSize}</p>
                  <p className="text-xs text-ink/50">TRAIN SAMPLES</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{result.testSize}</p>
                  <p className="text-xs text-ink/50">TEST SAMPLES</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        {stockData && result && (
          <div className="border border-structure p-6">
            <p className="text-xs uppercase tracking-terminal text-ink/70 mb-4">
              PRICE HISTORY + PREDICTION
            </p>
            <PredictionChart
              history={stockData.history}
              prediction={{
                date: result.targetDate,
                price: result.predictedPrice,
              }}
              currency={result.currency}
            />
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-ink/50 text-center mt-6 uppercase tracking-terminal">
          [ DISCLAIMER: THIS IS FOR EDUCATIONAL PURPOSES ONLY. NOT FINANCIAL ADVICE. ]
        </p>
      </div>
    </main>
  );
};

export default StockPredictor;
