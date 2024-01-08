import Records from "./Records";
import { setState } from "../redux/actions";
import { useSelector, useDispatch } from "react-redux";
import LeaguesCheck from "./LeaguesCheck";

const Leagues1 = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { primaryContent } = useSelector((state) => state.leagues);

  return (
    <>
      {/*
      <h2>
        <select
          value={primaryContent}
          onChange={(e) =>
            dispatch(setState({ primaryContent: e.target.value }))
          }
          className="active click"
        >
          <option>Records</option>
          <option>Checks</option>
        </select>
      </h2>
    */}
      {<LeaguesCheck secondaryTable={secondaryTable} />}
    </>
  );
};

export default Leagues1;
