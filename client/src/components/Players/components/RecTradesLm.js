import Search from "../../Common/Search";
import TableMain from "../../Common/TableMain";
import Roster from "../../Common/Roster";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios, { all } from "axios";
import { getAdpFormatted } from "../../Common/services/helpers/getAdpFormatted";
import { getOptimalLineupADP } from "../../Leagues/services/helpers/getOptimalLineupADP";
import LoadingIcon from "../../Common/LoadingIcon";

const RecTradesLm = () => {
  const dispatch = useDispatch();
  const { allplayers } = useSelector((state) => state.common);
  const { username, leagues, leaguemate_ids, adpLm } = useSelector(
    (state) => state.user
  );
  const [itemActive, setItemActive] = useState("");
  const [itemActive2, setItemActive2] = useState("");
  const [searchedLm, setSearchedLm] = useState("");
  const [lmPicks, setLmPicks] = useState([]);
  const [secondaryContent, setSecondaryContent] = useState("Tips");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLmRec = async (higher, lower) => {
      setIsLoading(true);
      const lm_rec = await axios.post("/draft/lm", {
        lm_user_id: searchedLm.id,
        higher: higher,
        lower: lower,
      });

      setLmPicks(
        Object.fromEntries(
          lm_rec.data.map((obj) => [
            obj.player_id,
            Object.fromEntries(
              lm_rec.data
                .filter((obj2) => obj2.player_id === obj.player_id)
                .map((obj2) => [
                  obj2.draft.draftpicks[0].player_id,
                  lm_rec.data.filter(
                    (obj2) =>
                      obj2.player_id === obj.player_id &&
                      obj2.draft.draftpicks[0].player_id ===
                        obj.draft.draftpicks[0].player_id
                  ),
                ])
            ),
          ])
        )
      );

      setIsLoading(false);
    };

    if (leagues && searchedLm?.id) {
      const higher = {};

      leagues
        .filter((league) =>
          league.rosters?.find((roster) => roster.user_id === searchedLm?.id)
        )
        .forEach((league) => {
          const lm_players =
            league.rosters.find((roster) => roster.user_id === searchedLm?.id)
              ?.players || [];

          league.userRoster.players?.forEach((player_id) => {
            if (!higher[player_id]) {
              higher[player_id] = {
                player_id: player_id,
                higher: [],
              };
            }

            lm_players
              .filter(
                (player_id2) =>
                  (adpLm?.Dynasty?.[player_id]?.adp || 999) >
                    (adpLm?.Dynasty?.[player_id2]?.adp || 999) &&
                  !higher[player_id].higher.includes(player_id2)
              )
              .forEach((player_id2) => {
                higher[player_id].higher.push(player_id2);
              });
          });
        });

      fetchLmRec(Object.values(higher), []);
    }
  }, [leagues, searchedLm]);

  const headers = [
    [
      { text: "Drafted by " + (searchedLm?.text || ""), colSpan: 3 },
      {
        text: "Over",
        colSpan: 3,
      },
      {
        text: "# D",
        colSpan: 1,
      },
      {
        text: "tips",
        colSpan: 1,
      },
    ],
  ];

  const body = Object.keys(lmPicks)
    .flatMap((player_id) => {
      return Object.keys(lmPicks[player_id]).map((player_id2) => {
        const tips = leagues.filter(
          (league) =>
            league.userRoster.players.includes(player_id2) &&
            league.rosters?.find(
              (roster) =>
                roster.user_id === searchedLm.id &&
                roster.players.includes(player_id)
            )
        );
        return {
          id: player_id + "_" + player_id2,
          sort1: tips.length,
          sort2: lmPicks[player_id][player_id2]?.length,
          list: [
            {
              text: allplayers[player_id2]?.full_name,
              colSpan: 3,
            },
            {
              text: allplayers[player_id]?.full_name,
              colSpan: 3,
            },
            {
              text: lmPicks[player_id][player_id2].length,
              colSpan: 1,
            },
            {
              text: tips.length,
              colSpan: 1,
            },
          ],
          secondary_table: (
            <>
              <div className="secondary nav">
                <button
                  className={
                    secondaryContent === "Tips" ? "active click" : "click"
                  }
                  onClick={() => setSecondaryContent("Tips")}
                >
                  Tips
                </button>
                <button
                  className={
                    secondaryContent === "Drafts" ? "active click" : "click"
                  }
                  onClick={() => setSecondaryContent("Drafts")}
                >
                  Drafts
                </button>
              </div>
              {secondaryContent === "Drafts" ? (
                <TableMain
                  type={"secondary"}
                  headers={[
                    [
                      {
                        text: allplayers[player_id2]?.full_name,
                        colSpan: 4,
                      },
                      {
                        text: "League",
                        colSpan: 4,
                      },
                      {
                        text: allplayers[player_id]?.full_name,
                        colSpan: 4,
                      },
                    ],
                  ]}
                  body={lmPicks[player_id][player_id2].map((pick) => {
                    return {
                      id: pick.draft.draft_id + "_" + pick.pick_no,
                      list: [
                        {
                          text: getAdpFormatted(
                            pick.draft.draftpicks[0].pick_no
                          ),
                          colSpan: 3,
                        },
                        {
                          text: pick.draft.league.name,
                          colSpan: 6,
                        },
                        {
                          text: getAdpFormatted(pick.pick_no),
                          colSpan: 3,
                        },
                      ],
                    };
                  })}
                />
              ) : (
                <TableMain
                  type={"secondary"}
                  headers={[
                    [
                      {
                        text: "League",
                        colSpan: 4,
                      },
                    ],
                  ]}
                  body={tips.map((league) => {
                    const lm_roster = league.rosters.find(
                      (roster) => roster.user_id === searchedLm?.id
                    );

                    return {
                      id: league.league_id,
                      list: [
                        {
                          text: league.name,
                          colSpan: 4,
                        },
                      ],
                      secondary_table: (
                        <>
                          <Roster
                            roster={{
                              ...league.userRoster,
                              starters: getOptimalLineupADP({
                                roster: league.userRoster,
                                roster_positions: league.roster_positions,
                                adpLm,
                                allplayers,
                              })
                                .filter((o) => o.slot_raw !== "BN")
                                .sort(
                                  (a, b) =>
                                    league.roster_positions.indexOf(
                                      a.slot_raw
                                    ) -
                                    league.roster_positions.indexOf(b.slot_raw)
                                )
                                .map((o) => o.player),
                            }}
                            league={league}
                            type={"tertiary half"}
                          />
                          <Roster
                            roster={{
                              ...lm_roster,
                              starters: getOptimalLineupADP({
                                roster: lm_roster,
                                roster_positions: league.roster_positions,
                                adpLm,
                                allplayers,
                              })
                                .filter((o) => o.slot_raw !== "BN")
                                .sort(
                                  (a, b) =>
                                    league.roster_positions.indexOf(
                                      a.slot_raw
                                    ) -
                                    league.roster_positions.indexOf(b.slot_raw)
                                )
                                .map((o) => o.player),
                            }}
                            league={league}
                            type={"tertiary half"}
                          />
                        </>
                      ),
                    };
                  })}
                  itemActive={itemActive2}
                  setItemActive={setItemActive2}
                />
              )}
            </>
          ),
        };
      });
    })
    .sort((a, b) => b.sort1 - a.sort1 || b.sort2 - a.sort2);

  const lm_list = leaguemate_ids.flatMap((leaguemate_id) => {
    const lm_roster = leagues
      .find((league) =>
        league.rosters.find((roster) => roster.user_id === leaguemate_id)
      )
      .rosters.find((roster) => roster.user_id === leaguemate_id);

    return {
      id: leaguemate_id,
      text: lm_roster?.username,
      image: {
        src: lm_roster?.avatar,
        alt: "leaguemate avatar",
        type: "user",
      },
    };
  });

  return isLoading ? (
    <LoadingIcon />
  ) : (
    <>
      <Search
        id={"By Leaguemate"}
        placeholder={`Leaguemate`}
        list={lm_list}
        searched={searchedLm}
        setSearched={setSearchedLm}
      />
      {searchedLm?.id ? (
        <TableMain
          type={"primary"}
          headers={headers}
          body={body}
          itemActive={itemActive}
          setItemActive={setItemActive}
        />
      ) : (
        <h2>
          Search Leaguemate to find players you own in common leagues that they
          drafted before player they own in that same league
        </h2>
      )}
    </>
  );
};

export default RecTradesLm;
