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
  const [po, setPo] = useState({});
  const [itemActive, setItemActive] = useState("");
  const [itemActive2, setItemActive2] = useState("");

  useEffect(() => {
    const fetchRecTrades = async () => {
      const recTrades = await axios.post("/draft/find", {
        player: player1.id,
        higher: Object.keys(adpLm?.Dynasty || {}).filter(
          (player_id) =>
            adpLm?.Dynasty?.[player_id]?.adp <
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
                r.picked_by,
                recTrades.data
                  .filter(
                    (r2) =>
                      r2.player_id === rec.player_id &&
                      r.picked_by === r2.picked_by
                  )
                  .map((r2) => r2.draft.league.name),
              ])
          ),
        ])
      );
      console.log(players_object);

      setPo(players_object);

      const leaguemates_object = Object.fromEntries(
        recTrades.data.map((rec) => [
          rec.picked_by,
          recTrades.data
            .filter((r) => r.picked_by === rec.picked_by)
            .map((r) => r.player_id),
        ])
      );
    };

    if (player1?.id) {
      fetchRecTrades();
    }
  }, [player1]);

  const header = [
    [
      { text: "Player", colSpan: 3 },
      { text: "ADP D", colSpan: 2 },
      { text: "# LM", colSpan: 1 },
    ],
  ];
  const body = Object.keys(po)
    .sort(
      (a, b) =>
        Array.from(new Set(Object.keys(po[b]))).length -
        Array.from(new Set(Object.keys(po[a]))).length
    )
    .map((player_id) => {
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
            colSpan: 2,
          },
          {
            text: leagues.filter((league) =>
              league.rosters.find(
                (roster) =>
                  Object.keys(po[player_id]).includes(roster.user_id) &&
                  roster.players?.includes(player1.id) &&
                  league.userRoster.players?.includes(player_id)
              )
            ).length,
            colSpan: 1,
          },
        ],
        secondary_table: (
          <TableMain
            type={"secondary"}
            headers={[]}
            body={Object.keys(po[player_id])
              .filter(
                (lm_user_id) =>
                  leagues.filter((league) =>
                    league.rosters.find(
                      (roster) =>
                        roster.user_id === lm_user_id &&
                        roster.players?.includes(player1.id) &&
                        league.userRoster.players?.includes(player_id)
                    )
                  ).length > 0
              )
              .sort(
                (a, b) =>
                  po[player_id].filter((x) => x === b).length -
                  po[player_id].filter((x) => x === a).length
              )
              .map((lm_user_id) => {
                const user = leagues
                  .flatMap((league) => league.rosters)
                  .find((roster) => roster.user_id === lm_user_id);

                const count = Object.keys(po[player_id]).filter(
                  (x) => x === lm_user_id
                ).length;

                const target_leagues = leagues.filter((league) =>
                  league.rosters.find(
                    (roster) =>
                      roster.user_id === lm_user_id &&
                      roster.players?.includes(player1.id) &&
                      league.userRoster.players?.includes(player_id)
                  )
                );
                return {
                  id: lm_user_id,
                  list: [
                    {
                      text: user.username,
                      colSpan: 3,
                      image: {
                        src: user.avatar,
                        alt: "avatar",
                        type: "user",
                      },
                      className: "left",
                    },
                    {
                      text: count + " - " + po[player_id][lm_user_id],
                      colSpan: 1,
                    },
                  ],
                  secondary_table: (
                    <TableMain
                      type={"tertiary"}
                      headers={[[{ text: "League", colSpan: 3 }]]}
                      body={[]}
                    />
                  ),
                };
              })}
            itemActive={itemActive2}
            setItemActive={setItemActive2}
          />
        ),
      };
    });

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
      <h1>
        {allplayers?.[player1.id]?.full_name} ADP:{" "}
        {(adpLm?.["Dynasty"]?.[player1.id]?.adp &&
          getAdpFormatted(adpLm?.["Dynasty"]?.[player1.id]?.adp)) ||
          999}
      </h1>
      <TableMain
        type={"primary"}
        headers={header}
        body={body}
        itemActive={itemActive}
        setItemActive={setItemActive}
      />
    </>
  );
};

export default RecTrades;
