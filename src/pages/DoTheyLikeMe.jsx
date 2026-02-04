import { useState, useMemo } from 'react';
import questions from '../data/questions.json';

const DoTheyLikeMe = () => {
    const [checkedState, setCheckedState] = useState({});

    const handleOnChange = (id) => {
        setCheckedState(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const totalScore = useMemo(() => {
        return questions.reduce((total, q) => {
            if (checkedState[q.id]) {
                return total + q.value;
            }
            return total;
        }, 0);
    }, [checkedState]);

    const getResult = (score) => {
        // Interpretation logic
        if (score <= -300) return "Result: You are harassing them. Stop";
        if (score <= -150) return "Result: Get a grip";
        if (score <= -50) return "Result: Pure delusion if you think they like you";
        if (score <= 0) return "Result: You’re in the friend zone, DO NOT MAKE A MOVE";
        if (score <= 75) return "Result: You guys are probably just friends";
        if (score <= 175) return "Result: They lowkey like you, but don't make a move because you could just be close friends";
        if (score <= 275) return "Result: They like you but are shy";
        if (score <= 375) return "Result: They like you, and are abvious about it";
        if (score <= 450) return "Result: They might be in love with you";
        return "Result: get married immediately";
    };

    const result = getResult(totalScore);

    // Default result text when no interaction (or consistent with original logic which shows "Result: Not enough data" initially? 
    // Original HTML had <h3 id="result">Result: Not enough data</h3>.
    // But the script logic would overwrite it immediately on change.
    // Let's show "Not enough data" if score is 0 and no checkboxes checked? 
    // Actually the original logic starts at 0. If 0 is "Friend zone", then initial state is "Friend zone".
    // But wait, the original HTML text was "Not enough data".
    // The script `updateScore` runs on 'change'. So initially it says "Not enough data". 
    // Once you click something, it updates.
    // If you uncheck everything back to 0, it says "Friend zone".
    // I will mimic this: if no keys checked, show "Not enough data".
    
    const hasInteracted = Object.values(checkedState).some(val => val);
    const displayResult = hasInteracted ? result : "Result: Not enough data";

    return (
        <main className="flex-grow flex flex-col items-center px-6 pb-20">
            {/* TITLE */}
            <h1 className="text-4xl font-bold mt-10 tracking-tight text-center">
                Do They Like Me?
            </h1>

            <h2 className="text-center text-neutral-400 mt-4 mb-10 leading-relaxed max-w-2xl">
                Check all that apply for the person of your choosing.<br />
                If there is a question you don't understand or are unsure of, answer no.
            </h2>

            <form className="w-full max-w-2xl flex flex-col gap-4">
                {questions.map((q) => (
                    <div className="flex items-start space-x-3 p-2 hover:bg-mid/50 rounded-lg transition-colors duration-200" key={q.id}>
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-accent rounded border-light/30 bg-mid focus:ring-offset-grayish focus:ring-accent mt-1 cursor-pointer"
                            id={q.id}
                            checked={!!checkedState[q.id]}
                            onChange={() => handleOnChange(q.id)}
                        />
                        <label htmlFor={q.id} className="text-light cursor-pointer select-none">
                            {q.text}
                        </label>
                    </div>
                ))}
            </form>

            <div className="mt-16 text-center sticky bottom-0 bg-grayish/95 backdrop-blur-sm w-full py-6 border-t border-light/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <h3 className="text-3xl font-bold text-accent mb-2">Score: {totalScore}</h3>
                <h3 className="text-xl text-light/80 font-display">{displayResult}</h3>
            </div>

        </main>
    );
};

export default DoTheyLikeMe;
