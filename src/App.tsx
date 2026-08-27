import { Counter } from "./components/Counter";

interface AppProps {
  greeting: string;
}

export function App({ greeting }: AppProps) {
  return <Counter heading={greeting} />;
}
