import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const NavItem = ({ to, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className="text-ink uppercase tracking-terminal font-semibold hover:bg-ink/80 hover:text-invert px-3 py-1 transition-none"
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
        <nav className="flex space-x-6 text-sm">
          <NavItem to="/" label="HOME" />
          <NavItem to="/projects" label="PROJECTS" />
          <NavItem to="/cv" label="CV" />
        </nav>
      </div>
    </header>
  );
};

export default Header;
