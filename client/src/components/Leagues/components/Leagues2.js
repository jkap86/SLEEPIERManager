import Standings from "../../Common/Standings";
import { useSelector, useDispatch } from "react-redux";
import { setState } from "../redux/actions";

const Leagues2 = ({ ...props }) => {
  const dispatch = useDispatch();
  const { tabSecondary } = useSelector((state) => state.leagues);

  return (
    <>
      <div className="secondary nav">
        <button
          className={tabSecondary === "Standings" ? "active click" : "click"}
          onClick={(e) => dispatch(setState({ tabSecondary: "Standings" }))}
        >
          Standings
        </button>
      </div>
      <Standings {...props} type={"secondary"} />
    </>
  );
};

export default Leagues2;
