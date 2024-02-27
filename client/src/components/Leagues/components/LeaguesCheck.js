import { useSelector, useDispatch } from "react-redux";
import { setState } from "../redux/actions";
import TableMain from "../../Common/TableMain/TableMain";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";
import { getColumnValue } from "../services/helpers/getColumns";
import { useMemo } from "react";
import { getOptimalLineupADP } from "../services/helpers/getOptimalLineupADP";
import HeaderDropdown from "../../Common/HeaderDropdown";

const LeaguesCheck = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { state, allplayers } = useSelector((state) => state.common);
  const { leagues, type1, type2, adpLm } = useSelector((state) => state.user);
  const { column1, column2, column3, column4, page, itemActive, searched } =
    useSelector((state) => state.leagues);

  // useMemo hook to optimize processing rosters updated with optimal lineup ADP

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

  // Column options for the leagues table

  const columnOptions = [
    "Open Roster",
    "Open Taxi",
    "Waivers Open",
    "Rank",
    "Dynasty Value",
    "Dynasty Players Value",
    "Dynasty Starters Value",
    "Dynasty Picks Value",
    "Dynasty Rank",
    "Dynasty Players Rank",
    "Dynasty Starters Rank",
    "Dynasty Picks Rank",
    "Redraft Value",
    "Redraft Starters Value",
    "Redraft Rank",
    "Redraft Starters Rank",
    "Trade Deadline",
    "W/L",
    "W %",
    "FP",
    "FPA",
    "% FP of Avg",
    "League ID",
  ];

  // Headers configuration for the table, utilizing dynamic state for column selection

  const headers = [
    [
      {
        text: "League",
        colSpan: 6,
        rowSpan: 2,
      },
      {
        text: (
          <HeaderDropdown
            column_text={column1}
            columnOptions={columnOptions}
            setState={(value) => dispatch(setState({ column1: value }))}
          />
        ),
        colSpan: 3,
        className: "left",
      },
      {
        text: (
          <HeaderDropdown
            column_text={column2}
            columnOptions={columnOptions}
            setState={(value) => dispatch(setState({ column2: value }))}
          />
        ),
        colSpan: 3,
        className: "left",
      },
      {
        text: (
          <HeaderDropdown
            column_text={column3}
            columnOptions={columnOptions}
            setState={(value) => dispatch(setState({ column3: value }))}
          />
        ),
        colSpan: 3,
        className: "left",
      },
      {
        text: (
          <HeaderDropdown
            column_text={column4}
            columnOptions={columnOptions}
            setState={(value) => dispatch(setState({ column4: value }))}
          />
        ),
        colSpan: 3,
        className: "left",
      },
    ],
  ];

  // Body data processing for the table, including filtering and mapping league data

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

  // Render TableMain component with dynamic data

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
