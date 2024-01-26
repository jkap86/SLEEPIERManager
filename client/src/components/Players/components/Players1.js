import Records from "./Records";
import useFetchPlayerShares from "../services/hooks/useFetchPlayerShares";
import useFetchLmPlayerShares from "../../Common/services/hooks/useFetchLmPlayerShares";
import { useSelector } from "react-redux";
import PlayersComparison from "./PlayersComparison";

const Players1 = ({ secondaryTable }) => {
  const { tabSecondary, primaryContent } = useSelector(
    (state) => state.players
  );

  useFetchPlayerShares();

  const condition = tabSecondary === "Leaguemate Shares";
  useFetchLmPlayerShares(condition);

  return (
    <>
      {primaryContent === "Comparison" ? (
        <PlayersComparison />
      ) : (
        <Records secondaryTable={secondaryTable} />
      )}
    </>
  );
};

export default Players1;
