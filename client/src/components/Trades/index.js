import Trades1 from "./components/Trades1";
import Trades2 from "./components/Trades2";

const Trades = () => {
  return <Trades1 secondaryTable={(props) => <Trades2 {...props} />} />;
};

export default Trades;
