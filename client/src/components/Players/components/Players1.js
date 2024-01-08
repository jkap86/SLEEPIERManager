import Records from "./Records";
import useFetchPlayerShares from "../services/hooks/useFetchPlayerShares";
import useFetchLmPlayerShares from "../../Common/services/hooks/useFetchLmPlayerShares";
import { useSelector } from "react-redux";

const Players1 = ({ secondaryTable }) => {
  const { tabSecondary } = useSelector((state) => state.players);

  useFetchPlayerShares();

  const condition = tabSecondary === "Leaguemate Shares";
  useFetchLmPlayerShares(condition);

  return (
    <>
      <Records secondaryTable={secondaryTable} />
    </>
  );
};

export default Players1;
