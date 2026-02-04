import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Cv from './pages/Cv';
import DoTheyLikeMe from './pages/DoTheyLikeMe';
import AreYouCompatible from './pages/AreYouCompatible';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-body bg-dark text-light">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/cv" element={<Cv />} />
          <Route path="/do-they-like-me" element={<DoTheyLikeMe />} />
          <Route path="/are-you-compatible" element={<AreYouCompatible />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
