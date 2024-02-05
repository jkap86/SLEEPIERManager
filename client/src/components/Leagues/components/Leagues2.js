import Standings from "../../Common/Standings";
import { useSelector, useDispatch } from "react-redux";
import { setState } from "../redux/actions";
import { useState } from "react";

const Leagues2 = ({ ...props }) => {
  const dispatch = useDispatch();
  const { tabSecondary } = useSelector((state) => state.leagues);
  const [expandRoster, setExpandRoster] = useState(false);

  return (
    <>
      <div className="secondary nav">
        <button
          className={tabSecondary === "Standings" ? "active click" : "click"}
          onClick={(e) => dispatch(setState({ tabSecondary: "Standings" }))}
        >
          Standings
        </button>
        {expandRoster ? (
          <i
            className="fa-solid fa-compress click"
            onClick={() => setExpandRoster(false)}
          ></i>
        ) : (
          <i
            className="fa-solid fa-expand click"
            onClick={() => setExpandRoster(true)}
          ></i>
        )}
      </div>
      <Standings {...props} type={"secondary"} expandRoster={expandRoster} />
    </>
  );
};

export default Leagues2;
