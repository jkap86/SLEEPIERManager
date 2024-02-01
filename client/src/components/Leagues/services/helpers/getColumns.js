import { getTrendColor } from "../../../Common/services/helpers/getTrendColor";
import { getOptimalLineupADP } from "./getOptimalLineupADP";

export const getColumnValue = (header, league, state, adpLm, allplayers) => {
  const record = {
    wins: league.userRoster.settings.wins,
    losses: league.userRoster.settings.losses,
    ties: league.userRoster.settings.ties,
    fpts: parseFloat(
      league.userRoster.settings.fpts +
        "." +
        league.userRoster.settings.fpts_decimal
    ),
    fpts_against: parseFloat(
      league.userRoster.settings.fpts_against +
        "." +
        league.userRoster.settings.fpts_against_decimal
    ),
  };

  const league_total_fp = league.rosters.reduce(
    (acc, cur) =>
      acc + parseFloat(cur.settings.fpts + "." + cur.settings.fpts_decimal),
    0
  );

  const percent_fp_of_avg =
    (record.fpts / (league_total_fp / league.rosters.length)) * 100;

  const budget_percent_players = league.userRoster.players.reduce(
    (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
    0
  );

  const optimal_lineup = getOptimalLineupADP({
    roster: league.userRoster,
    roster_positions: league.roster_positions,
    adpLm,
    allplayers,
  });

  const budget_percent_starters = optimal_lineup.reduce(
    (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur.player]?.adp || 0),
    0
  );

  const value_rank =
    league.rosters
      .sort(
        (a, b) =>
          (b.players?.reduce(
            (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
            0
          ) || 0) +
          (b.draft_picks?.reduce(
            (acc, cur) =>
              acc +
              (adpLm?.["Dynasty_auction"]?.[
                "R" +
                  +(
                    (cur.round - 1) * 12 +
                    (parseInt(
                      cur.season === parseInt(league.season) && cur.order
                    ) || 7)
                  )
              ]?.adp || 0),
            0
          ) || 0) -
          ((a.players?.reduce(
            (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
            0
          ) || 0) +
            (a.draft_picks?.reduce(
              (acc, cur) =>
                acc +
                (adpLm?.["Dynasty_auction"]?.[
                  "R" +
                    +(
                      (cur.round - 1) * 12 +
                      (parseInt(
                        cur.season === parseInt(league.season) && cur.order
                      ) || 7)
                    )
                ]?.adp || 0),
              0
            ) || 0))
      )
      .findIndex((obj) => obj.roster_id === league.userRoster.roster_id) + 1;

  const value_rank_players =
    league.rosters
      .sort(
        (a, b) =>
          (b.players?.reduce(
            (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
            0
          ) || 0) -
          (a.players?.reduce(
            (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
            0
          ) || 0)
      )
      .findIndex((obj) => obj.roster_id === league.userRoster.roster_id) + 1;

  const value_rank_starters =
    league.rosters
      .sort(
        (a, b) =>
          (getOptimalLineupADP({
            roster: b,
            roster_positions: league.roster_positions,
            adpLm,
            allplayers,
          })?.reduce(
            (acc, cur) =>
              acc + (adpLm?.["Dynasty_auction"]?.[cur.player]?.adp || 0),
            0
          ) || 0) -
          (getOptimalLineupADP({
            roster: a,
            roster_positions: league.roster_positions,
            adpLm,
            allplayers,
          })?.reduce(
            (acc, cur) =>
              acc + (adpLm?.["Dynasty_auction"]?.[cur.player]?.adp || 0),
            0
          ) || 0)
      )
      .findIndex((obj) => obj.roster_id === league.userRoster.roster_id) + 1;

  const value_rank_picks =
    league.rosters
      .sort(
        (a, b) =>
          (b.draft_picks?.reduce(
            (acc, cur) =>
              acc +
              (adpLm?.["Dynasty_auction"]?.[
                "R" +
                  +(
                    (cur.round - 1) * 12 +
                    (parseInt(
                      cur.season === parseInt(league.season) && cur.order
                    ) || 7)
                  )
              ]?.adp || 0),
            0
          ) || 0) -
          (a.draft_picks?.reduce(
            (acc, cur) =>
              acc +
              (adpLm?.["Dynasty_auction"]?.[
                "R" +
                  +(
                    (cur.round - 1) * 12 +
                    (parseInt(
                      cur.season === parseInt(league.season) && cur.order
                    ) || 7)
                  )
              ]?.adp || 0),
            0
          ) || 0)
      )
      .findIndex((obj) => obj.roster_id === league.userRoster.roster_id) + 1;

  const budget_percent_picks = league.userRoster.draft_picks.reduce(
    (acc, cur) =>
      acc +
      (adpLm?.["Dynasty_auction"]?.[
        "R" +
          +(
            (cur.round - 1) * 12 +
            (parseInt(cur.season === parseInt(league.season) && cur.order) || 7)
          )
      ]?.adp || 0),
    0
  );

  switch (header) {
    case "Waivers Open":
      return {
        text: (
          <p
            className={
              "stat check " + (league.settings.disable_adds ? "red" : "green")
            }
          >
            {league.settings.disable_adds ? "X" : <>&#x2714;</>}
          </p>
        ),
        colSpan: 3,
      };
    case "Trade Deadline":
      return {
        text: (
          <p
            className={
              "stat check " +
              (league.settings.disable_trades
                ? "red"
                : state.week > league.settings.trade_deadline
                ? "red"
                : "green ")
            }
            //style={getTrendColor(-((league.userRoster.rank / league.rosters.length) - .5), .0025)}
          >
            {league.settings.disable_trades ? (
              "X"
            ) : league.settings.trade_deadline === 99 ? (
              <i className="fa-solid fa-infinity"></i>
            ) : (
              league.settings.trade_deadline
            )}
          </p>
        ),
        colSpan: 3,
      };
    case "Rank":
      return {
        text: (
          <p
            className="stat check"
            style={getTrendColor(
              -(league.userRoster.rank / league.rosters.length - 0.5),
              0.0025
            )}
          >
            {league.userRoster.rank}
          </p>
        ),
        colSpan: 3,
        className: "relative",
      };
    case "Open Taxi":
      return {
        text:
          league.settings.taxi_slots > 0 && league.settings.best_ball !== 1 ? (
            league.settings.taxi_slots - (league.userRoster.taxi?.length || 0) >
            0 ? (
              <p className="stat check">
                {league.settings.taxi_slots -
                  (league.userRoster.taxi?.length || 0)}
              </p>
            ) : (
              <>&#x2714;</>
            )
          ) : (
            "-"
          ),
        colSpan: 3,
        className:
          league.settings.taxi_slots > 0 && league.settings.best_ball !== 1
            ? league.settings.taxi_slots -
                (league.userRoster.taxi?.length || 0) >
              0
              ? "red check"
              : "green check"
            : "",
      };
    case "Open Roster":
      const user_active_players = league.userRoster.players?.filter(
        (p) =>
          !league.userRoster.taxi?.includes(p) &&
          !league.userRoster.reserve?.includes(p)
      );
      return {
        text:
          league.roster_positions.length !== user_active_players?.length ? (
            <p className="stat check">
              {league.roster_positions.length - user_active_players?.length}
            </p>
          ) : (
            <>&#x2714;</>
          ),
        colSpan: 3,
        className:
          league.roster_positions.length !== user_active_players?.length
            ? "red check"
            : "green check",
      };
    case "W/L":
      return {
        text:
          `${record?.wins?.toString() || ""}-${
            record?.losses?.toString() || ""
          }` +
          (league.userRoster.settings.ties > 0
            ? `-${league.userRoster.settings.ties}`
            : ""),
        colSpan: 3,
      };
    case "W %":
      return {
        text: (record?.wins + record?.losses > 0
          ? record?.wins / (record?.wins + record?.losses)
          : "-"
        ).toLocaleString("en-US", {
          maximumFractionDigits: 4,
          minimumFractionDigits: 4,
        }),
        colSpan: 3,
      };
    case "FP":
      return {
        text: record.fpts?.toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
        colSpan: 3,
      };
    case "FPA":
      return {
        text: (record.fpts_against || 0)?.toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
        colSpan: 3,
      };
    case "% FP of Avg":
      return {
        text: (
          <p
            className="stat"
            style={getTrendColor(percent_fp_of_avg - 100, 0.05)}
          >
            {percent_fp_of_avg.toFixed() + "%"}
          </p>
        ),
        colSpan: 3,
      };
    case "Total Value (Auction Budget %)":
      const budget_percent = budget_percent_players + budget_percent_picks;
      return {
        text: budget_percent?.toFixed(0) + "%",
        colSpan: 3,
      };
    case "Players Value (Auction Budget %)":
      return { text: budget_percent_players?.toFixed(0) + "%", colSpan: 3 };
    case "Starters Value (Auction Budget %)":
      return { text: budget_percent_starters?.toFixed(0) + "%", colSpan: 3 };
    case "Picks Value (Auction Budget %)":
      return { text: budget_percent_picks?.toFixed(0) + "%", colSpan: 3 };
    case "Total Value Rank (Auction Budget %)":
      return {
        text: (
          <p
            className="stat"
            style={getTrendColor(
              -(value_rank / league.rosters.length - 0.5),
              0.0025
            )}
          >
            {value_rank.toFixed()}
          </p>
        ),
        colSpan: 3,
      };
    case "Players Value Rank (Auction Budget %)":
      return {
        text: (
          <p
            className="stat"
            style={getTrendColor(
              -(value_rank_players / league.rosters.length - 0.5),
              0.0025
            )}
          >
            {value_rank_players.toFixed()}
          </p>
        ),
        colSpan: 3,
      };
    case "Starters Value Rank (Auction Budget %)":
      return {
        text: (
          <p
            className="stat"
            style={getTrendColor(
              -(value_rank_starters / league.rosters.length - 0.5),
              0.0025
            )}
          >
            {value_rank_starters.toFixed()}
          </p>
        ),
        colSpan: 3,
      };
    case "Picks Value Rank (Auction Budget %)":
      return {
        text: (
          <p
            className="stat"
            style={getTrendColor(
              -(value_rank_picks / league.rosters.length - 0.5),
              0.0025
            )}
          >
            {value_rank_picks.toFixed()}
          </p>
        ),
        colSpan: 3,
      };
    default:
      return {
        text: "-",
        colSpan: 3,
      };
  }
};
