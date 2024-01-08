import TableMain from "../../Common/TableMain";
import { useSelector, useDispatch } from "react-redux";
import { setStatePlayers } from "../redux/actions";
import { useState, useMemo } from "react";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";
import { getTrendColor } from "../../Common/services/helpers/getTrendColor";
import LoadingIcon from "../../Common/LoadingIcon";

const PlayerLeagues = ({
  leagues_owned,
  leagues_taken,
  leagues_available,
  player_id,
  secondaryTable,
}) => {
  const dispatch = useDispatch();
  const { type1, type2, lmplayershares, isLoadingPS } = useSelector(
    (state) => state.user
  );
  const { tabSecondary, searchedSecondary } = useSelector(
    (state) => state.players
  );
  const [page2, setPage2] = useState(1);
  const [itemActive2, setItemActive2] = useState("");

  console.log({ lmplayershares });
  let player_leagues_headers = [
    [
      {
        text: "League",
        colSpan: 3,
        className: "half",
      },
      {
        text: "Rank",
        colSpan: 1,
      },
    ],
  ];

  if (tabSecondary === "Taken") {
    player_leagues_headers[0].push(
      ...[
        {
          text: "Manager",
          colSpan: 2,
        },
        {
          text: "Rank",
          colSpan: 1,
        },
      ]
    );
  }

  if (player_id.includes("NA")) {
    player_leagues_headers[0].push(
      ...[
        {
          text: "#",
          colSpan: 1,
        },
      ]
    );
  }

  const most_owned = useMemo(() => {
    let keys;

    switch (`${type1}-${type2}`) {
      case "All-All":
        keys = ["all"];
        break;
      case "Redraft-All":
        keys = ["r_b", "r_s"];

        break;
      case "Dynasty-All":
        keys = ["d_b", "d_s"];

        break;
      case "All-Bestball":
        keys = ["r_b", "d_b"];

        break;
      case "All-Lineup":
        keys = ["r_s", "d_s"];

        break;
      default:
        break;
    }

    const most_owned = (lmplayershares || [])
      ?.filter((lm) => lm?.user_id && lm?.playershares?.[player_id])
      ?.map((lm) => {
        return {
          user_id: lm.user_id,
          username: lm.username,
          avatar: lm.avatar,
          count: keys?.reduce(
            (acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[0],
            0
          ),
          percentage: (
            (keys?.reduce(
              (acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[0],
              0
            ) /
              keys?.reduce(
                (acc, cur) => acc + lm.playershares[player_id]?.[cur]?.[1],
                0
              )) *
            100
          ).toFixed(1),
        };
      });

    return most_owned;
  }, [type1, type2, lmplayershares]);

  const leagues_display =
    tabSecondary === "Owned"
      ? leagues_owned
      : tabSecondary === "Taken"
      ? leagues_taken
      : tabSecondary === "Available"
      ? leagues_available
      : [];

  const player_leagues_body = player_id.includes("NA")
    ? Array.from(
        new Set(
          filterLeagues(leagues_display, type1, type2).map((l) => l.league_id)
        )
      ).map((league_id) => {
        const lo = filterLeagues(leagues_display, type1, type2).find(
          (l) => l.league_id === league_id
        );

        const count = filterLeagues(leagues_display, type1, type2).filter(
          (l) => l.league_id === league_id
        ).length;

        const { wins, losses, ties } = lo.userRoster.settings;
        const winpct =
          wins + losses + ties > 0
            ? (wins / (wins + losses + ties)).toFixed(4)
            : "-";

        return {
          id: lo.league_id,
          search: {
            text: lo.name,
            image: {
              src: lo.avatar,
              alt: "league avatar",
              type: "league",
            },
          },
          list: [
            {
              text: lo.name,
              colSpan: 3,
              className: "left",
              image: {
                src: lo.avatar,
                alt: lo.name,
                type: "league",
              },
            },
            {
              text: (
                <p
                  className={"stat check"}
                  style={getTrendColor(
                    -(lo.userRoster.rank / lo.rosters.length - 0.5),
                    0.0025
                  )}
                >
                  {lo.userRoster?.rank || "-"}
                </p>
              ),
              colSpan: 1,
              className:
                lo.userRoster?.rank / lo.rosters.length <= 0.25
                  ? "green"
                  : lo.userRoster?.rank / lo.rosters.length >= 0.75
                  ? "red"
                  : null,
            },

            tabSecondary === "Taken"
              ? {
                  text: lo.lmRoster?.username || "Orphan",
                  colSpan: 2,
                  className: "left",
                  image: {
                    src: lo.lmRoster?.avatar,
                    alt: lo.lmRoster?.username,
                    type: "user",
                  },
                }
              : "",
            tabSecondary === "Taken"
              ? {
                  text: (
                    <p
                      className={"stat check"}
                      style={getTrendColor(
                        -(lo.lmRoster.rank / lo.rosters.length - 0.5),
                        0.0025
                      )}
                    >
                      {lo.lmRoster?.rank}
                    </p>
                  ),
                  colSpan: 1,
                  className:
                    lo.lmRoster?.rank / lo.rosters.length <= 0.25
                      ? "green"
                      : lo.lmRoster?.rank / lo.rosters.length >= 0.75
                      ? "red"
                      : null,
                }
              : "",
            {
              text: count,
              colSpan: 1,
            },
          ],
          secondary_table: secondaryTable({ league: lo }),
        };
      })
    : filterLeagues(leagues_display, type1, type2).map((lo) => {
        const { wins, losses, ties } = lo.userRoster.settings;
        const winpct =
          wins + losses + ties > 0
            ? (wins / (wins + losses + ties)).toFixed(4)
            : "-";

        return {
          id: lo.league_id,
          search: {
            text: lo.name,
            image: {
              src: lo.avatar,
              alt: "league avatar",
              type: "league",
            },
          },
          list: [
            {
              text: lo.name,
              colSpan: 3,
              className: "left",
              image: {
                src: lo.avatar,
                alt: lo.name,
                type: "league",
              },
            },
            {
              text: (
                <p
                  className={"stat check"}
                  style={getTrendColor(
                    -(lo.userRoster.rank / lo.rosters.length - 0.5),
                    0.0025
                  )}
                >
                  {lo.userRoster?.rank || "-"}
                </p>
              ),
              colSpan: 1,
              className:
                lo.userRoster?.rank / lo.rosters.length <= 0.25
                  ? "green"
                  : lo.userRoster?.rank / lo.rosters.length >= 0.75
                  ? "red"
                  : null,
            },

            tabSecondary === "Taken"
              ? {
                  text: lo.lmRoster?.username || "Orphan",
                  colSpan: 2,
                  className: "left",
                  image: {
                    src: lo.lmRoster?.avatar,
                    alt: lo.lmRoster?.username,
                    type: "user",
                  },
                }
              : "",
            tabSecondary === "Taken"
              ? {
                  text: (
                    <p
                      className={"stat check"}
                      style={getTrendColor(
                        -(lo.lmRoster.rank / lo.rosters.length - 0.5),
                        0.0025
                      )}
                    >
                      {lo.lmRoster?.rank}
                    </p>
                  ),
                  colSpan: 1,
                  className:
                    lo.lmRoster?.rank / lo.rosters.length <= 0.25
                      ? "green"
                      : lo.lmRoster?.rank / lo.rosters.length >= 0.75
                      ? "red"
                      : null,
                }
              : "",
          ],
          secondary_table: secondaryTable({ league: lo }),
        };
      });

  const leaguemate_shares_headers = [
    [
      {
        text: "Leaguemate",
        colSpan: 3,
      },
      {
        text: "#",
        colSpan: 2,
      },
      {
        text: "%",
        colSpan: 2,
      },
    ],
  ];
  const leaguemate_shares_body_count =
    lmplayershares &&
    most_owned
      ?.sort((a, b) => b.count - a.count)
      .slice(0, 25)
      ?.map((lm) => {
        return {
          id: lm.user_id,
          list: [
            {
              text: lm.username,
              colSpan: 3,
              className: "left",
              image: {
                src: lm.avatar,
                alt: "avatar",
                type: "user",
              },
            },
            {
              text: <>{lm.count}</>,
              colSpan: 2,
            },
            {
              text: (
                <>
                  <em>{lm.percentage + "%"}</em>
                </>
              ),
              colSpan: 2,
            },
          ],
        };
      });

  const leaguemate_shares_body_percentage =
    lmplayershares &&
    most_owned
      ?.sort((a, b) => b.percentage - a.percentage)
      .slice(0, 25)
      ?.map((lm) => {
        return {
          id: lm.user_id,
          list: [
            {
              text: lm.username,
              colSpan: 3,
              className: "left",
              image: {
                src: lm.avatar,
                alt: "avatar",
                type: "user",
              },
            },
            {
              text: lm.count,
              colSpan: 2,
            },
            {
              text: <em>{lm.percentage + "%"}</em>,
              colSpan: 2,
            },
          ],
        };
      });

  return (
    <>
      <div className="secondary nav">
        <button
          className={tabSecondary === "Owned" ? "active click" : "click"}
          onClick={(e) => dispatch(setStatePlayers({ tabSecondary: "Owned" }))}
        >
          Owned
        </button>
        <button
          className={tabSecondary === "Taken" ? "active click" : "click"}
          onClick={(e) => dispatch(setStatePlayers({ tabSecondary: "Taken" }))}
        >
          Taken
        </button>
        {player_id.includes("_") ? (
          ""
        ) : (
          <>
            <button
              className={
                tabSecondary === "Available" ? "active click" : "click"
              }
              onClick={(e) =>
                dispatch(setStatePlayers({ tabSecondary: "Available" }))
              }
            >
              Available
            </button>
            <button
              className={
                tabSecondary === "Leaguemate Shares" ? "active click" : "click"
              }
              onClick={(e) =>
                dispatch(setStatePlayers({ tabSecondary: "Leaguemate Shares" }))
              }
            >
              Leaguemate Shares
            </button>
          </>
        )}
      </div>
      {tabSecondary === "Leaguemate Shares" ? (
        isLoadingPS ? (
          <LoadingIcon />
        ) : (
          <>
            <TableMain
              type={"secondary half"}
              headers={leaguemate_shares_headers}
              body={leaguemate_shares_body_count || []}
            />
            <TableMain
              type={"secondary half"}
              headers={leaguemate_shares_headers}
              body={leaguemate_shares_body_percentage || []}
            />
          </>
        )
      ) : (
        <TableMain
          type={"secondary"}
          headers={player_leagues_headers}
          body={player_leagues_body}
          page={page2}
          setPage={setPage2}
          itemActive={itemActive2}
          setItemActive={setItemActive2}
          searched={searchedSecondary}
          setSearched={(value) =>
            dispatch(setStatePlayers({ searchedSecondary: value }))
          }
        />
      )}
    </>
  );
};

export default PlayerLeagues;
