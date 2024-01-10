import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Avatar from "../Common/Avatar";
import TableMain from "../Common/TableMain";
import axios from "axios";
import "./PlayoffPool.css";
import { getWeeklyResult } from "./helpers/getWeeklyResult";

const PlayoffPool = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState({});
  const [league, setLeague] = useState({});
  const [allplayers, setAllplayers] = useState({});
  const [schedule, setSchedule] = useState({});
  const [stats, setStats] = useState({});
  const [activeWeeks, setActiveWeeks] = useState([]);
  const [weeklyResults, setWeeklyResults] = useState({});
  const [itemActive, setItemActive] = useState("");

  const rounds = [
    { week: 19, name: "Wild Card" },
    { week: 20, name: "Divisional" },
    { week: 21, name: "Conference" },
    { week: 22, name: "Super Bowl" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const league = await axios.post("/league/find", {
        league_id: params.league_id,
      });

      setLeague(league.data);

      const allplayers = await axios.get("/main/allplayers");

      setAllplayers(allplayers.data);

      const state = await axios.get("/main/state");

      setState(state.data);

      const schedule = await axios.get("/main/schedule");

      setSchedule(schedule.data);

      const stats = await axios.get("/main/stats");

      setStats(stats.data);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const weeklyResults_update = {};

      Object.keys(stats).forEach((key) => {
        weeklyResults_update[key] = getWeeklyResult(
          league.rosters,
          league.roster_positions,
          league.scoring_settings,
          schedule[key],
          stats[key],
          allplayers
        );
      });

      setWeeklyResults(weeklyResults_update);
    }
  }, [state, league, schedule, stats, allplayers, isLoading]);

  useEffect(() => {
    setActiveWeeks(rounds.slice(0, Math.max(state.week, 1)).map((r) => r.week));
  }, [state]);
  console.log({ weeklyResults });
  const headers = [
    [
      {
        text: "Manager",
        colSpan: 4,
      },
      {
        text: "FP",
        colSpan: 3,
      },
      {
        text: "# Left",
        colSpan: 2,
      },
    ],
  ];

  const getFp = (roster_id) => {
    const fp = Object.keys(weeklyResults)
      .filter((week) => activeWeeks.includes(parseInt(week)))
      .reduce((acc, cur) => acc + weeklyResults[cur][roster_id]?.fp || 0, 0);

    return fp;
  };

  const getPlayersLeft = (roster_id) => {
    const last_week = Math.max(...activeWeeks.filter((x) => stats[x]));

    const active = weeklyResults[last_week]?.[roster_id]?.optimal_lineup
      .filter((player) => player.playing)
      .map((player) => player.player_id);

    return active;
  };

  const body = league.rosters
    ?.sort((a, b) => getFp(b.roster_id) - getFp(a.roster_id))
    ?.map((roster) => {
      const fp = getFp(roster.roster_id);

      const players_left = getPlayersLeft(roster.roster_id);

      const secondary_headers = [
        [
          {
            text: activeWeeks.length === 1 ? "Slot" : "Position",
            colSpan: 1,
          },
          {
            text: "Player",
            colSpan: 3,
          },
          {
            text: "FP",
            colSpan: 2,
          },
        ],
      ];

      const secondary_body =
        activeWeeks.length === 1
          ? weeklyResults[activeWeeks[0]]?.[
              roster.roster_id
            ]?.optimal_lineup?.map((op) => {
              return {
                id: op.player_id,
                list: [
                  {
                    text: op.slot_abbrev,
                    colSpan: 1,
                  },
                  {
                    text: allplayers[op.player_id]?.full_name,
                    colSpan: 3,
                    className: "left",
                    image: {
                      src: op.player_id,
                      alt: "headshot",
                      type: "player",
                    },
                  },
                  {
                    text: op.score.toFixed(2),
                    colSpan: 2,
                  },
                ],
              };
            })
          : roster.players.map((player_id) => {
              const fp_player = Object.keys(weeklyResults)
                .filter((week) => activeWeeks.includes(parseInt(week)))
                .reduce(
                  (acc, cur) =>
                    acc +
                    weeklyResults[cur][roster.roster_id].optimal_lineup.find(
                      (ol) => ol.player_id === player_id
                    ).score,
                  0
                );

              return {
                id: player_id,
                list: [
                  {
                    text: allplayers[player_id]?.position,
                    colSpan: 1,
                  },
                  {
                    text: allplayers[player_id]?.full_name,
                    colSpan: 3,
                    className: "left",
                    image: {
                      src: player_id,
                      alt: "headshot",
                      type: "player",
                    },
                  },
                  {
                    text: fp_player.toFixed(2),
                    colSpan: 2,
                  },
                ],
              };
            });

      return {
        id: roster.roster_id,
        list: [
          {
            text: roster.username || "-----",
            colSpan: 4,
            className: "left",
            image: roster.user_id && {
              src: roster.avatar,
              alt: "user avatar",
              type: "user",
            },
          },
          {
            text: fp.toFixed(2),
            colSpan: 3,
          },
          {
            text: players_left?.length || "-",
            colSpan: 2,
          },
        ],
        secondary_table: (
          <>
            <div className="secondary nav"></div>
            <TableMain
              type={"secondary"}
              headers={secondary_headers}
              body={secondary_body}
            />
          </>
        ),
      };
    });

  return (
    <>
      <Link to="/" className="home">
        Home
      </Link>
      <h1>
        <p className="image">
          <Avatar
            avatar_id={league?.avatar}
            alt={"league avatar"}
            type={"league"}
          />

          <strong>{league?.name}</strong>
        </p>
      </h1>
      <div className="rounds">
        <ol>
          {rounds.map((round, index) => {
            return (
              <li
                key={round.week}
                className={activeWeeks.includes(round.week) ? "active" : ""}
                onClick={() =>
                  activeWeeks.includes(round.week)
                    ? setActiveWeeks(
                        activeWeeks.filter((x) => x !== round.week)
                      )
                    : setActiveWeeks([...activeWeeks, round.week])
                }
              >
                {round.name}
              </li>
            );
          })}
        </ol>
      </div>
      <TableMain
        type={"primary"}
        headers={headers}
        body={body}
        itemActive={itemActive}
        setItemActive={setItemActive}
      />
    </>
  );
};

export default PlayoffPool;
