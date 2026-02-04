import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-16">
      <h1 className="text-5xl md:text-6xl font-display font-bold text-accent mb-6 drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
        Welcome to my website
      </h1>

      <p className="text-lg md:text-xl text-light/70 max-w-2xl mb-10 leading-relaxed">
        I’m a student who likes making random things
      </p>

      <Link to="/projects"
        className="bg-mid border border-light/30 text-light px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-grayish hover:scale-105 transition-all duration-300">
        Explore My Projects →
      </Link>

      <div className="mt-20">
         <h3 className="text-2xl font-bold text-accent mb-6 tracking-wide uppercase">My Favourite Song Right Now:</h3>
         <iframe
           style={{ borderRadius: '12px' }}
           src="https://open.spotify.com/embed/track/4WiiRw2PHMNQE0ad6y6GdD?utm_source=generator"
           width="100%"
           height="200"
           frameBorder="0"
           allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
           loading="lazy"
           title="Spotify Embed"
         >
         </iframe>
      </div>
    </main>
  );
};

export default Home;
