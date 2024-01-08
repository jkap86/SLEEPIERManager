import TableMain from "../../Common/TableMain";
import { useSelector, useDispatch } from "react-redux";
import { setStateLeaguemates } from "../redux/actions";
import Roster from "../../Common/Roster";
import { getTrendColor } from "../../Common/services/helpers/getTrendColor";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";

const LeaguemateLeagues = ({ leaguemate }) => {
  const dispatch = useDispatch();
  const { username, type1, type2 } = useSelector((state) => state.user);
  const { page_leagues, itemActive_leagues } = useSelector(
    (state) => state.leaguemates
  );

  const leaguemateLeagues_headers = [
    [
      {
        text: "League",
        colSpan: 4,
        rowSpan: 2,
        className: "half",
      },
      {
        text: leaguemate.username,
        colSpan: 4,
        className: "half",
      },
      {
        text: username,
        colSpan: 4,
        className: "half",
      },
    ],
    [
      {
        text: "Record",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Rank",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Record",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Rank",
        colSpan: 2,
        className: "half",
      },
    ],
  ];

  const leaguemateLeagues_body = filterLeagues(
    leaguemate.leagues,
    type1,
    type2
  ).map((lm_league) => {
    return {
      id: lm_league.league_id,
      list: [
        {
          text: lm_league.name,
          colSpan: 4,
          className: "left",
          image: {
            src: lm_league.avatar,
            alt: "avatar",
            type: "league",
          },
        },
        {
          text: `${lm_league.lmRoster.settings.wins}-${
            lm_league.lmRoster.settings.losses
          }${lm_league.lmRoster.ties > 0 ? `-${lm_league.lmRoster.ties}` : ""}`,
          colSpan: 2,
        },
        {
          text: (
            <p
              className={"stat check"}
              style={getTrendColor(
                -(lm_league.lmRoster.rank / lm_league.rosters.length - 0.5),
                0.0025
              )}
            >
              {lm_league.lmRoster.rank}
            </p>
          ),
          colSpan: 2,
          className: "relative",
        },
        {
          text: `${lm_league.userRoster.settings.wins}-${
            lm_league.userRoster.settings.losses
          }${
            lm_league.userRoster.ties > 0 ? `-${lm_league.userRoster.ties}` : ""
          }`,
          colSpan: 2,
        },
        {
          text: (
            <p
              className={"stat check"}
              style={getTrendColor(
                -(lm_league.userRoster.rank / lm_league.rosters.length - 0.5),
                0.0025
              )}
            >
              {lm_league.userRoster.rank}
            </p>
          ),
          colSpan: 2,
          className: "relative",
        },
      ],
      secondary_table: (
        <>
          <Roster
            roster={lm_league.lmRoster}
            league={lm_league}
            type={"tertiary half"}
          />
          <Roster
            roster={lm_league.userRoster}
            league={lm_league}
            type={"tertiary half"}
          />
        </>
      ),
    };
  });

  return (
    <TableMain
      id={"Players"}
      type={"secondary"}
      headers={leaguemateLeagues_headers}
      body={leaguemateLeagues_body}
      page={page_leagues}
      setPage={(page) => dispatch(setStateLeaguemates({ page_leagues: page }))}
      itemActive={itemActive_leagues}
      setItemActive={(itemActive) =>
        dispatch(setStateLeaguemates({ itemActive_leagues: itemActive }))
      }
    />
  );
};

export default LeaguemateLeagues;
