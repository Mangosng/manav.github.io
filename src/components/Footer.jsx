import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-grayish border-t border-light/10 py-10 mt-20 text-center">
      <div className="flex justify-center space-x-8 text-2xl mb-6">
        <a href="https://instagram.com/manav.2009" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-transform transform hover:scale-125">
          <i className="fab fa-instagram"></i>
        </a>
        <a href="https://github.com/ManavSanghrajka" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-transform transform hover:scale-125">
          <i className="fab fa-github"></i>
        </a>
        <a href="https://open.spotify.com/user/316ntxr3gfsimuv6cwvsg3dabxn4" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-transform transform hover:scale-125">
          <i className="fab fa-spotify"></i>
        </a>
        <a href="https://linkedin.com/in/manav-sanghrajka-654a73363/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-transform transform hover:scale-125">
          <i className="fab fa-linkedin"></i>
        </a>
        <a href="mailto:manavsanghrajka@gmail.com" className="hover:text-accent transition-transform transform hover:scale-125">
          <i className="fas fa-envelope"></i>
        </a>
      </div>

      <p className="text-light/50 text-sm tracking-wider">© 2025 Manav | Designed with React + Vite + Tailwind</p>
    </footer>
  );
};

export default Footer;
