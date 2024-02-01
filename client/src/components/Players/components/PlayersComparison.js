import TableMain from "../../Common/TableMain";
import Search from "../../Common/Search";
import LoadingIcon from "../../Common/LoadingIcon";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import { getAdpFormatted } from "../../Common/services/helpers/getAdpFormatted";

const PlayersComparison = () => {
  const dispatch = useDispatch();
  const { allplayers } = useSelector((state) => state.common);
  const { user_id, leagues, adpLm } = useSelector((state) => state.user);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [playerLeague, setPlayerLeague] = useState("");
  const [lm, setLm] = useState("");
  const [player1Obj, setPlayer1Obj] = useState([]);
  const [player2Obj, setPlayer2Obj] = useState([]);
  const [pagePlayer1, setPagePlayer1] = useState(1);
  const [pagePlayer2, setPagePlayer2] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchComp = async () => {
      setIsLoading(true);

      const lm_list =
        leagues &&
        Object.fromEntries(
          Array.from(
            new Set(
              leagues?.flatMap((league) =>
                league.rosters?.map((roster) => [
                  roster.user_id,
                  { avatar: roster.avatar, username: roster.username },
                ])
              )
            )
          )
        );

      const comp = await axios.post("/draft/playercomp", {
        lm_user_ids: Object.keys(lm_list),
        player1: player1.id,
        player2: player2.id,
        user_id: user_id,
      });

      const obj1 = Object.fromEntries(
        Array.from(new Set(comp.data.list1.map((p) => p.picked_by))).map(
          (picked_by) => [
            picked_by,
            {
              user_id: picked_by,
              username: lm_list[picked_by].username,
              avatar: lm_list[picked_by].avatar,
              count: comp.data.list1.filter((p) => p.picked_by === picked_by)
                .length,
            },
          ]
        )
      );

      const obj2 = Object.fromEntries(
        Array.from(new Set(comp.data.list2.map((p) => p.picked_by))).map(
          (picked_by) => [
            picked_by,
            {
              user_id: picked_by,
              username: lm_list[picked_by].username,
              avatar: lm_list[picked_by].avatar,
              count: comp.data.list2.filter((p) => p.picked_by === picked_by)
                .length,
            },
          ]
        )
      );

      console.log({ obj2 });

      setPlayer1Obj(Object.values(obj1));
      setPlayer2Obj(Object.values(obj2));

      setIsLoading(false);
    };

    if (player1?.id && player2?.id) {
      fetchComp();
    }
  }, [player1, player2]);

  useEffect(() => {
    if (!player1?.id || !player2?.id) {
      setPlayerLeague("");
      setLm("");
    }
  }, [player1, player2]);

  const getHeaders = (player_id) => {
    return [
      [
        {
          text:
            allplayers[player_id]?.full_name +
            ` (${
              (adpLm?.["Dynasty"]?.[player_id]?.adp &&
                getAdpFormatted(adpLm?.["Dynasty"]?.[player_id]?.adp)) ||
              999
            })`,
          colSpan: 4,
          className: "half",
        },
      ],
      [
        {
          text: "Leaguemate",
          colSpan: 3,
          className: "half",
        },
        {
          text: "#",
          colSpan: 1,
          className: "half",
        },
      ],
    ];
  };

  const getBody = (list) => {
    return list
      .filter(
        (lm) =>
          !playerLeague?.id ||
          leagues
            .find((l) => l.league_id === playerLeague?.id)
            .rosters.find((r) => r.user_id === lm.user_id)
      )
      .sort((a, b) => b.count - a.count)
      .map((lm) => {
        return {
          id: lm.user_id,
          list: [
            {
              text: lm.username,
              image: {
                src: lm.avatar,
                alt: "leaguemate avatar",
                type: "user",
              },
              colSpan: 3,
              className: "left",
            },
            {
              text: lm.count,
              colSpan: 1,
            },
          ],
        };
      });
  };

  const league_list = leagues
    .filter((league) =>
      league.rosters.find(
        (r) =>
          player1Obj.find((p) => p.user_id === r.user_id) ||
          player2Obj.find((p) => p.user_id === r.user_id)
      )
    )
    .map((league) => {
      return {
        id: league.league_id,
        text: league.name,
        image: {
          src: league.avatar,
          alt: "league avatar",
          type: "league",
        },
      };
    });

  const lm_list = Object.values(
    Object.fromEntries(
      [...player1Obj, ...player2Obj]
        .filter(
          (lm) =>
            !playerLeague?.id ||
            leagues
              .find((l) => l.league_id === playerLeague?.id)
              .rosters.find((r) => r.user_id === lm.user_id)
        )
        .map((lm) => [
          lm.user_id,
          {
            id: lm.user_id,
            text: lm.username,
            image: {
              src: lm.avatar,
              alt: "lm avatar",
              type: "user",
            },
          },
        ])
    )
  );

  console.log({ lm_list });

  return (
    <>
      <h2>Which player is drafted first when both available</h2>
      <Search
        id={"By Player"}
        placeholder={`Player 1`}
        list={players_list}
        searched={player1}
        setSearched={setPlayer1}
      />

      <Search
        id={"By Player"}
        placeholder={`Player 2`}
        list={players_list.filter((p) => p.id !== player1.id)}
        searched={player2}
        setSearched={setPlayer2}
      />

      {isLoading ? (
        <LoadingIcon />
      ) : player1.id && player2.id ? (
        <>
          <Search
            id={"By League"}
            placeholder={`League`}
            list={league_list}
            searched={playerLeague}
            setSearched={setPlayerLeague}
          />
          <Search
            id={"By Leaguemate"}
            placeholder={`Leaguemate`}
            list={lm_list}
            searched={lm}
            setSearched={setLm}
          />
          <TableMain
            type={"primary half"}
            headers={getHeaders(player1.id)}
            body={getBody(player1Obj)}
            page={pagePlayer1}
            setPage={setPagePlayer1}
          />
          <TableMain
            type={"primary half"}
            headers={getHeaders(player2.id)}
            body={getBody(player2Obj)}
            pagePlayer2={pagePlayer2}
            setPagePlayer2={setPagePlayer2}
          />
        </>
      ) : null}
    </>
  );
};

export default PlayersComparison;
