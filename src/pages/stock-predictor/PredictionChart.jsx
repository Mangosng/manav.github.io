import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

const PredictionChart = ({ history, prediction, currency }) => {
  // Take last 90 days of history for cleaner visualization
  const recentHistory = history.slice(-90);
  
  // Prepare chart data
  const chartData = recentHistory.map((d) => ({
    date: d.date,
    price: d.close,
    type: 'historical',
  }));

  // Add prediction point
  if (prediction) {
    chartData.push({
      date: prediction.date,
      price: null,
      predicted: prediction.price,
      type: 'prediction',
    });
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (value) => {
    if (value == null) return '';
    return `$${value.toFixed(2)}`;
  };

  // Calculate Y-axis domain
  const prices = recentHistory.map((d) => d.close);
  if (prediction) prices.push(prediction.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-structure)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="var(--color-ink)"
            tick={{ fill: 'var(--color-ink)', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={formatPrice}
            stroke="var(--color-ink)"
            tick={{ fill: 'var(--color-ink)', fontSize: 10 }}
          />
          <Tooltip
            formatter={(value, name) => [formatPrice(value), name === 'price' ? 'Price' : 'Predicted']}
            labelFormatter={formatDate}
            contentStyle={{
              backgroundColor: 'var(--color-canvas)',
              border: '1px solid var(--color-structure)',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-ink)"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
          {prediction && (
            <ReferenceDot
              x={prediction.date}
              y={prediction.price}
              r={8}
              fill="var(--color-highlight)"
              stroke="var(--color-invert)"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-ink inline-block"></span>
          <span className="text-ink/70">HISTORICAL</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-highlight inline-block"></span>
          <span className="text-ink/70">PREDICTION</span>
        </span>
      </div>
    </div>
  );
};

export default PredictionChart;
