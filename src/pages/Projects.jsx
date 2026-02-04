import { Link } from 'react-router-dom';

const Projects = () => {
    return (
        <main className="flex-grow flex flex-col items-center justify-start py-16 px-6">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-12 tracking-tight text-center text-accent">My Projects</h1>

            <section className="flex justify-center items-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full justify-items-center">

                <Link to="/do-they-like-me" className="group bg-grayish border border-light/10 rounded-2xl p-8 hover:bg-mid hover:border-light/30 transition-all duration-300 flex flex-col items-center text-center shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] max-w-sm">
                <div className="flex items-center justify-center mb-6 text-5xl text-accent/70 group-hover:text-accent transition-all duration-300">
                    <i className="fas fa-heart"></i>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3 text-accent">Do They Like Me Quiz</h3>
                <p className="text-light/70 text-base leading-relaxed"> Find out if they like you, or not</p>
                </Link>

                <Link to="/are-you-compatible" className="group bg-grayish border border-light/10 rounded-2xl p-8 hover:bg-mid hover:border-light/30 transition-all duration-300 flex flex-col items-center text-center shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.08)] max-w-sm">
                <div className="flex items-center justify-center mb-6 text-5xl text-accent/70 group-hover:text-accent transition-all duration-300">
                    <i className="fas fa-heart"></i>
                </div>
                <h3 className="font-display text-2xl font-semibold mb-3 text-accent">Compatibility Quiz</h3>
                <p className="text-light/70 text-base leading-relaxed"> Find out if you both are compatible</p>
                </Link>

            </div>
            </section>
        </main>
    );
};
export default Projects;
