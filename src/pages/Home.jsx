import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-ink uppercase tracking-terminal mb-6">
        WELCOME TO MY WEBSITE
      </h1>

      <p className="text-sm md:text-base text-ink/70 max-w-2xl mb-10 leading-relaxed">
        I'm a student who likes making random things
      </p>

      <Link to="/projects"
        className="bg-highlight text-invert px-8 py-4 font-semibold uppercase tracking-terminal hover:bg-invert hover:text-highlight border border-highlight transition-none">
        [ EXPLORE PROJECTS → ]
      </Link>

      <div className="mt-20 w-full max-w-md">
         <h3 className="text-sm font-bold text-ink mb-6 tracking-terminal uppercase">
           [ MY FAVOURITE SONG RIGHT NOW ]
         </h3>
         <div className="border border-structure p-4">
           <iframe
             style={{ borderRadius: '0px' }}
             src="https://open.spotify.com/embed/track/4WiiRw2PHMNQE0ad6y6GdD?utm_source=generator"
             width="100%"
             height="152"
             frameBorder="0"
             allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
             loading="lazy"
             title="Spotify Embed"
           >
           </iframe>
         </div>
      </div>
    </main>
  );
};

export default Home;
