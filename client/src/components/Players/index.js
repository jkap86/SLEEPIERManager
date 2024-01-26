import Players1 from "./components/Players1";
import Players2 from "./components/Players2";
import Players3 from "./components/Players3";
import { useSelector, useDispatch } from "react-redux";
import { setStatePlayers } from "./redux/actions";

const Players = () => {
  const dispatch = useDispatch();
  const { primaryContent } = useSelector((state) => state.players);

  return (
    <>
      <h2>
        <select
          value={primaryContent}
          onChange={(e) =>
            dispatch(setStatePlayers({ primaryContent: e.target.value }))
          }
          className="active click"
        >
          <option>All</option>
          <option>Comparison</option>
        </select>
      </h2>
      <Players1
        secondaryTable={(props) => (
          <Players2
            {...props}
            secondaryTable={(props2) => {
              return <Players3 {...props2} />;
            }}
          />
        )}
      />
    </>
  );
};

export default Players;
