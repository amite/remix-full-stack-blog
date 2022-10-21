import { useState } from "react";

export default function Counter() {
  const [counter, setCounter] = useState(0);

  //increase counter
  const increase = () => {
    setCounter((count) => count + 1);
  };

  //decrease counter
  const decrease = () => {
    setCounter((count) => count - 1);
  };

  //reset counter
  const reset = () => {
    setCounter(0);
  };
  return (
    <div className="container mx-auto counter py-9">
      <h1>React Counter</h1>
      <span className="counter__output">{counter}</span>
      <div className="btn__container">
        <button onClick={increase} className="btn">
          +
        </button>
        <button onClick={decrease} className="btn">
          -
        </button>
        <button onClick={reset} className="btn btn-outline btn-accent">
          Reset
        </button>
      </div>
    </div>
  );
}
