import { useSelector, useDispatch } from "react-redux";
import { setState } from "../redux/actions";
import TableMain from "../../Common/TableMain/TableMain";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";
import { getColumnValue } from "../services/helpers/getColumns";
import { useEffect } from "react";

const LeaguesCheck = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { state } = useSelector((state) => state.common);
  const { leagues, type1, type2, adpLm } = useSelector((state) => state.user);
  const {
    column1,
    column2,
    column3,
    column4,
    page,
    itemActive,
    searched,
    primaryContent,
  } = useSelector((state) => state.leagues);

  /*
  useEffect(() => {
    if (primaryContent === "Records") {
      dispatch(setState({ column1: "W/L" }));
      dispatch(setState({ column2: "W %" }));
      dispatch(setState({ column3: "Rank" }));
      dispatch(setState({ column4: "% FP of Avg" }));
    } else if (primaryContent === "Checks") {
      dispatch(setState({ column1: "Open Roster" }));
      dispatch(setState({ column2: "Open Taxi" }));
      dispatch(setState({ column3: "Rank" }));
      dispatch(setState({ column4: "% FP of Avg" }));
    }
  }, [primaryContent, dispatch]);
  */

  const columnOptions = [
    "Open Roster",
    "Open Taxi",
    "Waivers Open",
    "Rank",
    "Auction Budget% D",
    "Auction Budget% D Players",
    "Auction Budget% D Picks",
    "Trade Deadline",
    "W/L",
    "W %",
    "FP",
    "FPA",
    "% FP of Avg",
  ];

  const headers = [
    [
      {
        text: "League",
        colSpan: 6,
        rowSpan: 2,
      },
      {
        text: (
          <p className="option">
            {column1}

            <select
              value={column1}
              className="hidden_behind click"
              onChange={(e) => dispatch(setState({ column1: e.target.value }))}
            >
              {columnOptions.map((column) => {
                return <option key={column}>{column}</option>;
              })}
            </select>
          </p>
        ),
        colSpan: 3,
        className: "left",
      },
      {
        text: (
          <p className="option">
            {column2}
            <select
              value={column2}
              className="hidden_behind click"
              onChange={(e) => dispatch(setState({ column2: e.target.value }))}
            >
              {columnOptions.map((column) => {
                return <option key={column}>{column}</option>;
              })}
            </select>
          </p>
        ),
        colSpan: 3,
        className: "left",
      },
      {
        text: (
          <p className="option">
            {column3}
            <select
              value={column3}
              className="hidden_behind click"
              onChange={(e) => dispatch(setState({ column3: e.target.value }))}
            >
              {columnOptions.map((column) => {
                return <option key={column}>{column}</option>;
              })}
            </select>
          </p>
        ),
        colSpan: 3,
        className: "left",
      },
      {
        text: (
          <p className="option">
            {column4}
            <select
              value={column4}
              className="hidden_behind click"
              onChange={(e) => dispatch(setState({ column4: e.target.value }))}
            >
              {columnOptions.map((column) => {
                return <option key={column}>{column}</option>;
              })}
            </select>
          </p>
        ),
        colSpan: 3,
        className: "left",
      },
    ],
  ];

  const body = filterLeagues(leagues, type1, type2).map((league) => {
    return {
      id: league.league_id,
      search: {
        text: league.name,
        image: {
          src: league.avatar,
          alt: "league avatar",
          type: "league",
        },
      },
      list: [
        {
          text: league.name,
          colSpan: 6,
          className: "left",
          image: {
            src: league.avatar,
            alt: league.name,
            type: "league",
          },
        },
        {
          ...getColumnValue(column1, league, state, adpLm),
        },
        {
          ...getColumnValue(column2, league, state, adpLm),
        },
        {
          ...getColumnValue(column3, league, state, adpLm),
        },
        {
          ...getColumnValue(column4, league, state, adpLm),
        },
      ],
      secondary_table: secondaryTable({ league }),
    };
  });

  return (
    <>
      <TableMain
        type={"primary"}
        headers={headers}
        body={body}
        page={page}
        setPage={(value) => dispatch(setState({ page: value }))}
        itemActive={itemActive}
        setItemActive={(value) => dispatch(setState({ itemActive: value }))}
        searched={searched}
        setSearched={(value) => dispatch(setState({ searched: value }))}
      />
    </>
  );
};

export default LeaguesCheck;
