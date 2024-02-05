import { useSelector, useDispatch } from "react-redux";
import { setState } from "../redux/actions";
import TableMain from "../../Common/TableMain/TableMain";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";
import { getColumnValue } from "../services/helpers/getColumns";
import { useEffect, useMemo } from "react";
import { getOptimalLineupADP } from "../services/helpers/getOptimalLineupADP";
import Modal from "../../Common/Modal/Modal";

const LeaguesCheck = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { state, allplayers } = useSelector((state) => state.common);
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

  const rosters_updated = useMemo(() => {
    return (
      (leagues &&
        Object.fromEntries(
          leagues.map((league) => {
            const rosters_updated_league = league.rosters.map((roster) => {
              return {
                ...roster,
                starters: getOptimalLineupADP({
                  roster,
                  roster_positions: league.roster_positions,
                  adpLm,
                  allplayers,
                })
                  .sort(
                    (a, b) =>
                      league.roster_positions.indexOf(a.slot_raw) -
                      league.roster_positions.indexOf(b.slot_raw)
                  )
                  .map((ol) => ol.player),
              };
            });

            return [league.league_id, rosters_updated_league];
          })
        )) ||
      {}
    );
  }, [leagues, adpLm, allplayers]);

  const columnOptions = [
    "Open Roster",
    "Open Taxi",
    "Waivers Open",
    "Rank",
    "Total Value (Auction Budget %)",
    "Players Value (Auction Budget %)",
    "Starters Value (Auction Budget %)",
    "Picks Value (Auction Budget %)",
    "Total Value Rank (Auction Budget %)",
    "Players Value Rank (Auction Budget %)",
    "Starters Value Rank (Auction Budget %)",
    "Picks Value Rank (Auction Budget %)",
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

  const body = filterLeagues(leagues, type1, type2)
    .filter(
      (league) =>
        (!searched?.id && !parseInt(searched)) ||
        league.league_id.startsWith(searched.toString()) ||
        searched?.id === league.league_id
    )
    .map((league) => {
      const rosters_updated_league = rosters_updated[league.league_id];
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
            ...getColumnValue(column1, league, state, adpLm, allplayers),
          },
          {
            ...getColumnValue(column2, league, state, adpLm, allplayers),
          },
          {
            ...getColumnValue(column3, league, state, adpLm, allplayers),
          },
          {
            ...getColumnValue(column4, league, state, adpLm, allplayers),
          },
        ],
        secondary_table: secondaryTable({
          league: {
            ...league,
            rosters: rosters_updated_league,
          },
        }),
      };
    });

  return (
    <>
      {/* <Modal icon={<i className="fa-solid fa-circle-info click"></i>} />*/}
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
