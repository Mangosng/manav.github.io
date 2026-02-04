import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    const baseClass = "text-light/80 hover:text-accent hover:tracking-wider transition-all duration-300";
    // We can add specific active styling if desired, but for now matching the original behavior (which didn't seem to have prominent active state other than hover, but React Router allows us to add one if we want).
    // The original just had links.
    return baseClass; 
  };

  return (
    <header className="bg-grayish border-b border-light/10 sticky top-0 z-50 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
      <nav className="container mx-auto flex justify-center py-4 space-x-10 text-lg font-semibold uppercase tracking-wide">
        <Link to="/" className={getLinkClass("/")}>Home</Link>
        <Link to="/projects" className={getLinkClass("/projects")}>Projects</Link>
        <Link to="/cv" className={getLinkClass("/cv")}>CV</Link>
      </nav>
    </header>
  );
};

export default Header;
