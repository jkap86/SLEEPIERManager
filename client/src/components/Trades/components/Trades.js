import axios from "axios";
import { useEffect } from "react";

const Trades = () => {
  useEffect(() => {
    const fetchLmTrades = async () => {
      const trades = await axios.post("/trade/leaguemate", {
        user_id: "424024949334740992",
        offset: 0,
        limit: 100,
        type1: "All",
        type2: "All",
      });

      console.log({ trades });
    };

    fetchLmTrades();
  }, []);
};

export default Trades;
