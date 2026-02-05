import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const NavItem = ({ to, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className="text-ink uppercase tracking-terminal font-semibold hover:bg-highlight hover:text-invert px-3 py-1 transition-none"
      >
        {isActive ? `[*] ${label}` : `[ ] ${label}`}
      </Link>
    );
  };

  return (
    <header className="bg-canvas border-b border-dotted border-structure sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="text-ink font-semibold uppercase tracking-terminal text-sm hover:bg-highlight hover:text-invert px-2 py-1 transition-none">
          [ MANAV.IO ]
        </Link>
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-6 text-sm">
            <NavItem to="/" label="HOME" />
            <NavItem to="/projects" label="PROJECTS" />
            <NavItem to="/cv" label="CV" />
          </nav>
          <button
            onClick={toggleTheme}
            className="text-ink uppercase tracking-terminal font-semibold text-sm border border-structure px-3 py-1 hover:bg-highlight hover:text-invert hover:border-highlight transition-none"
            aria-label="Toggle theme"
          >
            {isDark ? '[ ☀ LIGHT ]' : '[ ☾ DARK ]'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
