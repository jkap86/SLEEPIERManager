import TableMain from "../../Common/TableMain";
import Search from "../../Common/Search";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios, { all } from "axios";
import { getAdpFormatted } from "../../Common/services/helpers/getAdpFormatted";

const RecTrades = () => {
  const dispatch = useDispatch();
  const { allplayers } = useSelector((state) => state.common);
  const { user_id, leagues, adpLm, leaguemate_ids } = useSelector(
    (state) => state.user
  );
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [poHigher, setPoHigher] = useState({});
  const [poLower, setPoLower] = useState({});
  const [itemActive, setItemActive] = useState("");
  const [itemActive2, setItemActive2] = useState("");
  const [findTab, setFindTab] = useState("Lower");
  const [secondaryTab, setSecondaryTab] = useState("Tips");

  const fetchHigher = async () => {
    setFindTab("Higher");
    const recTrades = await axios.post("/draft/higher", {
      player: player1.id,
      higher: Object.keys(adpLm?.Dynasty || {}).filter(
        (player_id) =>
          (adpLm?.Dynasty?.[player_id]?.adp || 999) <
          (adpLm?.Dynasty?.[player1.id]?.adp || 999)
      ),
      leaguemate_ids: leaguemate_ids,
    });

    const players_object = Object.fromEntries(
      recTrades.data.map((rec) => [
        rec.player_id,
        Object.fromEntries(
          recTrades.data
            .filter((r) => r.player_id === rec.player_id)
            .map((r) => [
              r.picked_by || r.draft.draftpicks[0]?.picked_by,
              recTrades.data
                .filter(
                  (r2) =>
                    r2.player_id === rec.player_id &&
                    (r.picked_by || r.draft.draftpicks[0]?.picked_by) ===
                      (r2.picked_by || r2.draft.draftpicks[0]?.picked_by)
                )
                .map((r2) => {
                  return {
                    league_id: r2.draft.league.league_id,
                    name: r2.draft.league.name,
                    dates: `${new Date(
                      parseInt(r2.draft.start_time)
                    ).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })} - ${new Date(
                      parseInt(r2.draft.last_picked)
                    ).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}`,
                  };
                }),
            ])
        ),
      ])
    );
    console.log(players_object);

    setPoHigher({ player_id: player1.id, data: players_object });

    const leaguemates_object = Object.fromEntries(
      recTrades.data.map((rec) => [
        rec.picked_by || rec.draft.draftpicks[0]?.picked_by,
        recTrades.data
          .filter(
            (r) =>
              (r.picked_by || r.draft.draftpicks[0]?.picked_by) ===
              (rec.picked_by || rec.draft.draftpicks[0]?.picked_by)
          )
          .map((r) => r.player_id),
      ])
    );
  };

  const fetchLower = async () => {
    setFindTab("Lower");
    const recTrades = await axios.post("/draft/lower", {
      player: player1.id,
      lower: Object.keys(adpLm?.Dynasty || {}).filter(
        (player_id) =>
          (adpLm?.Dynasty?.[player_id]?.adp || 999) >
          (adpLm?.Dynasty?.[player1.id]?.adp || 999)
      ),
      leaguemate_ids: leaguemate_ids,
    });

    const players_object = Object.fromEntries(
      recTrades.data.map((rec) => [
        rec.player_id,
        Object.fromEntries(
          recTrades.data
            .filter((r) => r.player_id === rec.player_id)
            .map((r) => [
              r.picked_by || r.draft.draftpicks[0]?.picked_by,
              recTrades.data
                .filter(
                  (r2) =>
                    r2.player_id === rec.player_id &&
                    (r.picked_by || r.draft.draftpicks[0]?.picked_by) ===
                      (r2.picked_by || r2.draft.draftpicks[0]?.picked_by)
                )
                .map((r2) => {
                  return {
                    league_id: r2.draft.league.league_id,
                    name: r2.draft.league.name,
                    dates: `${new Date(
                      parseInt(r2.draft.start_time)
                    ).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })} - ${new Date(
                      parseInt(r2.draft.last_picked)
                    ).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "2-digit",
                    })}`,
                  };
                }),
            ])
        ),
      ])
    );
    console.log(players_object);

    setPoLower({ player_id: player1.id, data: players_object });

    const leaguemates_object = Object.fromEntries(
      recTrades.data.map((rec) => [
        rec.picked_by || rec.draft.draftpicks[0]?.picked_by,
        recTrades.data
          .filter(
            (r) =>
              (r.picked_by || r.draft.draftpicks[0]?.picked_by) ===
              (rec.picked_by || rec.draft.draftpicks[0]?.picked_by)
          )
          .map((r) => r.player_id),
      ])
    );
  };

  const header = [
    [
      { text: "Player", colSpan: 3 },
      { text: "ADP D", colSpan: 1 },
      { text: "# LM", colSpan: 1 },
      { text: "tips", colSpan: 1 },
    ],
  ];
  const getBody = (po) => {
    return Object.keys(po)
      .sort(
        (a, b) =>
          Array.from(new Set(Object.keys(po[b]))).length -
          Array.from(new Set(Object.keys(po[a]))).length
      )
      .map((player_id) => {
        const target_leagues = leagues.filter((league) =>
          league.rosters.find(
            (roster) =>
              Object.keys(po[player_id]).includes(roster.user_id) &&
              roster.players?.includes(
                findTab === "Higher" ? player_id : player1.id
              ) &&
              league.userRoster.players?.includes(
                findTab === "Higher" ? player1.id : player_id
              )
          )
        );
        return {
          id: player_id,
          list: [
            {
              text: player_id.startsWith("R")
                ? getAdpFormatted(player_id.replace("R", ""))
                : allplayers[player_id]?.full_name || player_id,
              colSpan: 3,
            },
            {
              text:
                (adpLm?.["Dynasty"]?.[player_id]?.adp &&
                  getAdpFormatted(adpLm?.["Dynasty"]?.[player_id]?.adp)) ||
                999,
              colSpan: 1,
            },
            {
              text: Object.keys(po[player_id]).length,
              colSpan: 1,
            },
            {
              text: target_leagues.length?.toString(),
              colSpan: 1,
            },
          ],
          secondary_table: (
            <>
              <div className="secondary nav"></div>
              <TableMain
                type={"secondary"}
                headers={[
                  [
                    {
                      text: "Leaguemate",
                      colSpan: 3,
                    },
                    {
                      text: "#",
                      colSpan: 1,
                    },
                  ],
                ]}
                body={Object.keys(po[player_id])
                  .sort(
                    (a, b) => po[player_id][b].length - po[player_id][a].length
                  )
                  .map((lm_user_id) => {
                    const user = leagues
                      .flatMap((league) => league.rosters)
                      .find((roster) => roster.user_id === lm_user_id);

                    const count = Object.keys(po[player_id]).filter(
                      (x) => x === lm_user_id
                    ).length;

                    const target_leagues_lm = leagues.filter((league) =>
                      league.rosters.find(
                        (roster) =>
                          lm_user_id === roster.user_id &&
                          roster.players?.includes(
                            findTab === "Higher" ? player_id : player1.id
                          ) &&
                          league.userRoster.players?.includes(
                            findTab === "Higher" ? player1.id : player_id
                          )
                      )
                    );
                    const className =
                      target_leagues_lm.length > 0 ? "redb" : "";
                    return {
                      id: lm_user_id,
                      list: [
                        {
                          text: user?.username,
                          colSpan: 3,
                          image: {
                            src: user?.avatar,
                            alt: "avatar",
                            type: "user",
                          },
                          className: "left " + className,
                        },
                        {
                          text: count,
                          colSpan: 1,
                          className: className,
                        },
                      ],
                      secondary_table: (
                        <>
                          <div className="tertiary nav">
                            <button
                              className={
                                secondaryTab === "Tips"
                                  ? "active click"
                                  : "click"
                              }
                              onClick={() => setSecondaryTab("Tips")}
                            >
                              Tips
                            </button>
                            <button
                              className={
                                secondaryTab === "Leagues Drafted"
                                  ? "active click"
                                  : "click"
                              }
                              onClick={() => setSecondaryTab("Leagues Drafted")}
                            >
                              Leagues Drafted
                            </button>
                          </div>
                          <TableMain
                            type={"tertiary"}
                            headers={[[{ text: "League", colSpan: 3 }]]}
                            body={(secondaryTab === "Tips"
                              ? target_leagues_lm
                              : po[player_id][lm_user_id]
                            ).map((league) => {
                              return {
                                id: league.league_id,
                                list: [
                                  {
                                    text: (
                                      <>
                                        {league.name}{" "}
                                        <em>
                                          {league.dates && `(${league.dates})`}
                                        </em>
                                      </>
                                    ),
                                    colSpan: 3,
                                  },
                                ],
                              };
                            })}
                          />
                        </>
                      ),
                    };
                  })}
                itemActive={itemActive2}
                setItemActive={setItemActive2}
              />
            </>
          ),
        };
      });
  };

  const body =
    findTab === "Higher"
      ? getBody(poHigher.data || {})
      : getBody(poLower.data || {});

  const players_list =
    (leagues &&
      Array.from(
        new Set(
          leagues
            ?.map((league) => league.rosters?.map((roster) => roster.players))
            .flat(3)
        )
      ).map((player_id) => {
        return {
          id: player_id,
          text: allplayers[player_id]?.full_name,
          image: {
            src: player_id,
            alt: "player headshot",
            type: "player",
          },
        };
      })) ||
    [];

  return (
    <>
      <Search
        id={"By Player"}
        placeholder={`Player 1`}
        list={players_list}
        searched={player1}
        setSearched={setPlayer1}
      />
      {player1?.id && (
        <>
          <h1>
            {allplayers?.[player1.id]?.full_name} ADP:{" "}
            {(adpLm?.["Dynasty"]?.[player1.id]?.adp &&
              getAdpFormatted(adpLm?.["Dynasty"]?.[player1.id]?.adp)) ||
              999}
          </h1>
          <div className="flex">
            <button
              className={findTab === "Higher" ? "active" : ""}
              onClick={fetchHigher}
            >
              Higher
            </button>
            <button
              className={findTab === "Lower" ? "active" : ""}
              onClick={fetchLower}
            >
              Lower
            </button>
          </div>
        </>
      )}
      <h2>
        {player1?.id ? (
          findTab === "Higher" ? (
            <h2>{`Players with HIGHER adp than ${
              allplayers[player1.id]?.full_name
            } but drafted LOWER than ${allplayers[player1.id]?.full_name}`}</h2>
          ) : (
            <h2>{`Players with LOWER adp than ${
              allplayers[player1.id]?.full_name
            } but drafted HIGHER than ${
              allplayers[player1.id]?.full_name
            }`}</h2>
          )
        ) : (
          <h2>
            Search Player to find other players that leaguemates are
            higher/lower on than adp
          </h2>
        )}
      </h2>
      {player1.id &&
        player1.id ===
          (findTab === "Higher" ? poHigher.player_id : poLower.player_id) && (
          <TableMain
            type={"primary"}
            headers={header}
            body={body}
            itemActive={itemActive}
            setItemActive={setItemActive}
          />
        )}
    </>
  );
};

export default RecTrades;
