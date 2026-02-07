import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Cv from './pages/Cv';
import DoTheyLikeMe from './pages/DoTheyLikeMe';
import AreYouCompatible from './pages/AreYouCompatible';
import ScoutHome from './pages/scout4308/ScoutHome';
import EventDashboard from './pages/scout4308/EventDashboard';
import StockPredictor from './pages/stock-predictor/StockPredictor';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-mono bg-canvas text-ink">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/cv" element={<Cv />} />
            <Route path="/do-they-like-me" element={<DoTheyLikeMe />} />
            <Route path="/are-you-compatible" element={<AreYouCompatible />} />
            <Route path="/scout4308" element={<ScoutHome />} />
            <Route path="/scout4308/event/:eventKey" element={<EventDashboard />} />
            <Route path="/stock-predictor" element={<StockPredictor />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
