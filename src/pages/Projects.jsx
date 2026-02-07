import { Link } from 'react-router-dom';

const Projects = () => {
    return (
        <main className="flex-grow flex flex-col items-center justify-start py-16 px-6">
            <h1 className="text-2xl md:text-3xl font-bold text-ink uppercase tracking-terminal mb-12 text-center">
                [ MY PROJECTS ]
            </h1>

            <section className="flex justify-center items-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl w-full">

                <Link to="/stock-predictor" className="group border border-structure p-8 hover:bg-ink hover:text-invert hover:border-ink transition-none flex flex-col items-start text-left">
                  <span className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50 mb-2">
                    [ ML TOOL ]
                  </span>
                  <h3 className="text-lg font-bold uppercase tracking-terminal mb-3 text-ink group-hover:text-invert">
                    Stock Price Predictor
                  </h3>
                  <p className="text-sm text-ink/70 group-hover:text-invert/70 leading-relaxed">
                    Multiple Linear Regression model predicting stock prices using technical indicators
                  </p>
                  <span className="mt-4 text-sm font-semibold uppercase tracking-terminal text-ink group-hover:text-invert">
                    [ OPEN → ]
                  </span>
                </Link>

                <Link to="/scout4308" className="group border border-structure p-8 hover:bg-ink hover:text-invert hover:border-ink transition-none flex flex-col items-start text-left">
                  <span className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50 mb-2">
                    [ FRC TOOL ]
                  </span>
                  <h3 className="text-lg font-bold uppercase tracking-terminal mb-3 text-ink group-hover:text-invert">
                    Scout4308
                  </h3>
                  <p className="text-sm text-ink/70 group-hover:text-invert/70 leading-relaxed">
                    FRC Team 4308 scouting system with TBA + Statbotics integration
                  </p>
                  <span className="mt-4 text-sm font-semibold uppercase tracking-terminal text-ink group-hover:text-invert">
                    [ OPEN → ]
                  </span>
                </Link>

                <Link to="/are-you-compatible" className="group border border-structure p-8 hover:bg-ink hover:text-invert hover:border-ink transition-none flex flex-col items-start text-left">
                  <span className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50 mb-2">
                    [ QUIZ ]
                  </span>
                  <h3 className="text-lg font-bold uppercase tracking-terminal mb-3 text-ink group-hover:text-invert">
                    Compatibility Quiz
                  </h3>
                  <p className="text-sm text-ink/70 group-hover:text-invert/70 leading-relaxed">
                    Find out if you both are compatible
                  </p>
                  <span className="mt-4 text-sm font-semibold uppercase tracking-terminal text-ink group-hover:text-invert">
                    [ START → ]
                  </span>
                </Link>

                <Link to="/do-they-like-me" className="group border border-structure p-8 hover:bg-ink hover:text-invert hover:border-ink transition-none flex flex-col items-start text-left">
                  <span className="text-xs uppercase tracking-terminal text-ink/50 group-hover:text-invert/50 mb-2">
                    [ QUIZ ]
                  </span>
                  <h3 className="text-lg font-bold uppercase tracking-terminal mb-3 text-ink group-hover:text-invert">
                    Do They Like Me?
                  </h3>
                  <p className="text-sm text-ink/70 group-hover:text-invert/70 leading-relaxed">
                    Find out if they like you, or not
                  </p>
                  <span className="mt-4 text-sm font-semibold uppercase tracking-terminal text-ink group-hover:text-invert">
                    [ START → ]
                  </span>
                </Link>

            </div>
            </section>
        </main>
    );
};
export default Projects;
