import React from "react";
import { useSelector } from "react-redux";
import TableMain from "../../Common/TableMain";
import Avatar from "../../Common/Avatar";
import { getTrendColor } from "../../Common/services/helpers/getTrendColor";

const Trade = ({ trade }) => {
  const { state: stateState, allplayers } = useSelector(
    (state) => state.common
  );

  const date = new Date().toISOString().split("T")[0];

  const type =
    trade["league.roster_positions"].filter(
      (p) => p === "QB" || p === "SUPER_FLEX"
    ).length > 1
      ? "sf"
      : "oneqb";

  const no_qb = trade["league.roster_positions"].filter(
    (p) => p === "QB"
  ).length;

  const no_sf = trade["league.roster_positions"].filter(
    (p) => p === "SUPER_FLEX"
  ).length;

  const no_te = trade["league.roster_positions"].filter(
    (p) => p === "TE"
  ).length;

  const te_prem = trade["league.scoring_settings"]?.bonus_rec_te || 0;

  const getTradeValue = (player_id, date, type) => {
    return 5;
  };

  const getKtcPickName = (pick) => {
    const suffix =
      pick.round === 1
        ? "st"
        : pick.round === 2
        ? "nd"
        : pick.round === 3
        ? "rd"
        : "th";

    return `${pick.season} ${
      (pick.order >= 1 &&
        (pick.order <= 4 ? "Early" : pick.order >= 9 ? "Late" : "Mid")) ||
      "Mid"
    } ${pick.round}${suffix}`;
  };

  return (
    <TableMain
      type={"trade_summary"}
      headers={[]}
      body={[
        {
          id: "title",
          list: [
            {
              text: (
                <div className="timestamp">
                  <div>
                    {new Date(
                      parseInt(trade.status_updated)
                    ).toLocaleDateString("en-US")}
                  </div>
                  <div>
                    {new Date(
                      parseInt(trade.status_updated)
                    ).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ),
              colSpan: 3,
              className: "small wrap",
            },
            {
              text: (
                <>
                  <div>
                    {trade["league.settings"].type === 2
                      ? "Dynasty"
                      : trade["league.settings"].type === 1
                      ? "Keeper"
                      : "Redraft"}
                  </div>
                  <div>
                    {trade["league.settings"].best_ball === 1
                      ? "Bestball"
                      : "Lineup"}
                  </div>
                </>
              ),
              colSpan: 2,
              className: "type",
            },
            {
              text: trade["league.name"],
              colSpan: 8,
              image: {
                src: trade?.["league.avatar"],
                alt: "league avatar",
                type: "league",
              },
              className: "left",
            },
            {
              text: (
                <>
                  <div>
                    {no_qb.toString()} QB {no_sf.toString()} SF
                  </div>
                  <div>
                    {no_te.toString()} TE{" "}
                    {te_prem.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    Prem
                  </div>
                </>
              ),
              colSpan: 3,
              className: "type",
            },
          ],
        },
        ...Object.keys(trade.rosters).map((rid) => {
          const roster = trade.rosters[rid];

          const trade_value_players = 5;

          const trade_value_picks = 5;

          const trade_value_total = trade_value_players + trade_value_picks;

          const current_value_players = 5;

          const current_value_picks = 5;

          const current_value_total =
            current_value_players + current_value_picks;

          const trend_total = current_value_total - trade_value_total;

          return {
            id: trade.transaction_id,
            list: [
              {
                text: (
                  <div className="trade_manager">
                    <div>
                      <p className="value">
                        KTC -&nbsp;
                        {trade_value_total}
                      </p>
                      <p
                        className={
                          trend_total > 0
                            ? "green trend"
                            : trend_total < 0
                            ? "red trend"
                            : "trend"
                        }
                        style={getTrendColor(trend_total, 1.5)}
                      >
                        {trend_total > 0 ? "+" : ""}
                        {trend_total.toString()}
                      </p>
                    </div>
                    <div>
                      <p className="left">
                        {
                          <Avatar
                            avatar_id={roster?.avatar}
                            alt={"user avatar"}
                            type={"user"}
                          />
                        }
                        <span>{roster?.username || "Orphan"}</span>
                      </p>
                    </div>
                  </div>
                ),
                colSpan: 5,
                className: "left trade_manager",
              },
              {
                text: (
                  <table className="trade_info">
                    <tbody>
                      {Object.keys(trade.adds || {})
                        .filter((a) => trade.adds[a] === roster?.user_id)
                        .map((player_id) => {
                          const value =
                            getTradeValue(player_id, date, type) ||
                            getTradeValue(
                              player_id,
                              new Date(new Date() - 24 * 60 * 60 * 1000)
                                .toISOString()
                                .split("T")[0],
                              type
                            );

                          const trade_value = 4;

                          const trend = (value || 0) - (trade_value || 0);

                          return (
                            <tr>
                              <td
                                colSpan={11}
                                className={`${
                                  trade.tips?.trade_away &&
                                  trade.tips?.trade_away?.find(
                                    (p) => p.player_id === player_id
                                  )?.manager.user_id === rid
                                    ? "red left"
                                    : "left"
                                }`}
                              >
                                <p>
                                  <span>
                                    + {allplayers[player_id]?.full_name}
                                  </span>
                                </p>
                              </td>
                              <td className="value" colSpan={4}>
                                {trade_value.toString()}
                              </td>
                              <td colSpan={4}>
                                <div className="relative">
                                  <p
                                    className={"stat value"}
                                    style={getTrendColor(trend, 1)}
                                  >
                                    {trend > 0 ? "+" : ""}
                                    {trend}
                                  </p>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {trade.draft_picks
                        .filter((p) => p.owner_id === parseInt(rid))
                        .sort(
                          (a, b) => a.season - b.season || a.round - b.round
                        )
                        .map((pick) => {
                          const ktc_name = getKtcPickName(pick);

                          const value =
                            getTradeValue(ktc_name, date, type) ||
                            getTradeValue(
                              ktc_name,
                              new Date(new Date() - 24 * 60 * 60 * 1000)
                                .toISOString()
                                .split("T")[0],
                              type
                            );

                          const trade_value = 3;

                          const trend = (value || 0) - (trade_value || 0);
                          return (
                            <tr>
                              <td
                                colSpan={11}
                                className={`${
                                  trade.tips?.trade_away &&
                                  trade.tips?.trade_away?.find(
                                    (p) =>
                                      p?.player_id?.season === pick.season &&
                                      p?.player_id?.round === pick.round &&
                                      p?.player_id?.order === pick.order
                                  )?.manager?.user_id === rid
                                    ? "red left"
                                    : "left"
                                }`}
                              >
                                {
                                  <p>
                                    <span>{`+ ${pick.season} Round ${
                                      pick.round
                                    }${
                                      pick.order &&
                                      pick.season === stateState.league_season
                                        ? `.${pick.order.toLocaleString(
                                            "en-US",
                                            { minimumIntegerDigits: 2 }
                                          )}`
                                        : ` (${
                                            pick.original_user?.username ||
                                            "Orphan"
                                          })`
                                    }`}</span>
                                  </p>
                                }
                              </td>
                              <td className="value" colSpan={4}>
                                {trade_value.toString()}
                              </td>
                              <td colSpan={4} className="relative">
                                <p
                                  className={"stat value"}
                                  style={getTrendColor(trend, 1)}
                                >
                                  {trend > 0 ? "+" : ""}
                                  {trend}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                ),
                colSpan: 7,
                rowSpan: 2,
                className: "small",
              },
              {
                text: (
                  <table className="trade_info">
                    <tbody>
                      {Object.keys(trade.drops || {})
                        .filter((d) => trade.drops[d] === roster?.user_id)
                        .map((player_id) => (
                          <tr>
                            <td
                              className={
                                "left end" +
                                `${
                                  trade.tips?.acquire &&
                                  trade.tips?.acquire?.find(
                                    (p) => p.player_id === player_id
                                  )?.manager?.user_id === rid
                                    ? "green"
                                    : ""
                                }`
                              }
                              colSpan={4}
                            >
                              <p>
                                <span className="end">
                                  {`- ${allplayers[player_id]?.full_name}`.toString()}
                                </span>
                              </p>
                            </td>
                          </tr>
                        ))}
                      {trade.draft_picks
                        .filter(
                          (p) => p.previous_owner_id === roster?.roster_id
                        )
                        .sort(
                          (a, b) => a.season - b.season || a.round - b.round
                        )
                        .map((pick) => (
                          <tr>
                            <td
                              colSpan={4}
                              className={
                                "left end " +
                                `${
                                  trade.tips?.acquire &&
                                  trade.tips?.acquire?.find(
                                    (p) =>
                                      p?.player_id?.season === pick.season &&
                                      p?.player_id?.round === pick.round &&
                                      p?.player_id?.order === pick.order
                                  )?.manager?.user_id === rid
                                    ? "green left"
                                    : "left"
                                }`
                              }
                            >
                              <p>
                                <span className="end">
                                  {`- ${pick.season} Round ${pick.round}${
                                    pick.order &&
                                    pick.season === stateState.league_season
                                      ? `.${pick.order.toLocaleString("en-US", {
                                          minimumIntegerDigits: 2,
                                        })}`
                                      : ` (${
                                          pick.original_user?.username ||
                                          "Orphan"
                                        })`
                                  }`.toString()}
                                </span>
                              </p>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ),
                colSpan: 4,
                rowSpan: 2,
                className: "small",
              },
            ],
          };
        }),
      ]}
    />
  );
};

export default React.memo(Trade);
