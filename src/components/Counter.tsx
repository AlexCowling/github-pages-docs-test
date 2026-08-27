import { useState } from "react";

interface CounterProps {
  heading: string;
}

export function Counter({ heading }: CounterProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="counter">
      <h2 className="counter__heading">{heading}</h2>
      <p className="counter__value">{count}</p>
      <button className="counter__button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button className="counter__button" onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}
