import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Avatar from "../Common/Avatar";
import TableMain from "../Common/TableMain";
import axios from "axios";
import "./PlayoffPool.css";
import { getWeeklyResult } from "./helpers/getWeeklyResult";
import Search from "../Common/Search";
import FilterIcons from "../Common/FilterIcons";

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
  const [searched, setSearched] = useState("");
  const [filterPosition, setFilterPosition] = useState("W/R/T/Q");
  const [filterTeam, setFilterTeam] = useState("All");

  const rounds = [
    {
      week: 19,
      name: "Wild Card",
      cutoff_start: new Date("January 16, 2023").getTime(),
      cutoff_end: new Date("January 16, 2024").getTime(),
    },
    {
      week: 20,
      name: "Divisional",
      cutoff_start: new Date("January 19, 2024").getTime(),
      cutoff_end: new Date("January 20, 2024").getTime(),
    },
    {
      week: 21,
      name: "Conference",
      cutoff_start: new Date("January 23, 2024").getTime(),
      cutoff_end: new Date("January 27, 2024").getTime(),
    },
    {
      week: 22,
      name: "Super Bowl",
      cutoff_start: new Date("January 30, 2024").getTime(),
      cutoff_end: new Date("February 11, 2024").getTime(),
    },
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
        const cutoff_start = rounds.find(
          (r) => r.week === parseInt(key)
        )?.cutoff_start;

        const cutoff_end = rounds.find(
          (r) => r.week === parseInt(key)
        )?.cutoff_end;

        if (cutoff_start !== undefined) {
          weeklyResults_update[key] = getWeeklyResult(
            league.league_id,
            league.rosters,
            league.roster_positions,
            league.scoring_settings,
            schedule[key],
            stats[key],
            allplayers,
            league.adds,
            league.drops,
            cutoff_start,
            cutoff_end
          );
        }
      });

      setWeeklyResults(weeklyResults_update);
    }
  }, [state, league, schedule, stats, allplayers, isLoading]);

  useEffect(() => {
    setActiveWeeks(rounds.slice(0, Math.max(state.week, 1)).map((r) => r.week));
  }, [state]);

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
      .reduce((acc, cur) => acc + (weeklyResults[cur][roster_id]?.fp || 0), 0);

    return fp;
  };

  const getPlayersLeft = (roster_id, filter = false) => {
    const last_week = Math.max(...activeWeeks.filter((x) => stats[x]));

    const active = weeklyResults[last_week]?.[roster_id]?.optimal_lineup
      .filter(
        (player) =>
          (player.playing ||
            (last_week === 19 &&
              ["SF", "BAL"].includes(allplayers[player.player_id]?.team))) &&
          (filter
            ? (filterTeam === "All" ||
                allplayers[player.player_id]?.team === filterTeam) &&
              (filterPosition === allplayers[player.player_id]?.position ||
                filterPosition
                  .split("/")
                  .includes(
                    allplayers[player.player_id]?.position?.slice(0, 1)
                  ))
            : true)
      )
      .map((player) => player.player_id);

    return active;
  };

  console.log({ searched });
  const body = league.rosters
    ?.filter(
      (roster) => searched === "" || roster.players?.includes(searched.id)
    )
    ?.sort((a, b) => getFp(b.roster_id) - getFp(a.roster_id))
    ?.map((roster) => {
      const fp = getFp(roster.roster_id);

      const players_left = getPlayersLeft(roster.roster_id);

      const secondary_headers = [
        [
          {
            text: activeWeeks.length === 1 ? "Slot" : "Position",
            colSpan: 1,
            rowSpan: activeWeeks.length > 1 ? 2 : 1,
          },
          {
            text: "Player",
            colSpan: 3,
            rowSpan: activeWeeks.length > 1 ? 2 : 1,
          },
          {
            text: "FP",
            colSpan: 2,
            className: activeWeeks.length > 1 ? "half" : "",
          },
        ],
        activeWeeks.length > 1
          ? [
              {
                text: "Lineup",
                colSpan: 1,
                className: "half",
              },
              {
                text: "Bench",
                colSpan: 1,
                className: "half",
              },
            ]
          : [],
      ];

      const getFpPlayer = (player_id, bench = false) => {
        const fp_player = Object.keys(weeklyResults)
          .filter((week) => activeWeeks.includes(parseInt(week)))
          .reduce(
            (acc, cur) =>
              acc +
              (weeklyResults[cur][roster.roster_id].optimal_lineup.find(
                (ol) =>
                  ol.player_id === player_id && (bench || ol.slot !== "BN")
              )?.score || 0),
            0
          );
        return fp_player;
      };

      const secondary_body =
        activeWeeks.length === 1
          ? weeklyResults[activeWeeks[0]]?.[
              roster.roster_id
            ]?.optimal_lineup?.map((op) => {
              const className = players_left.includes(op.player_id)
                ? op.in_progress
                  ? "yellow"
                  : op.advanced ||
                    (activeWeeks[0] === 19 &&
                      ["SF", "BAL"].includes(allplayers[op.player_id]?.team))
                  ? "green"
                  : ""
                : "red";
              return {
                id: op.player_id,
                list: [
                  {
                    text: op.slot_abbrev,
                    className: className,
                    colSpan: 1,
                  },
                  {
                    text: !allplayers[op.player_id]
                      ? "-"
                      : allplayers[op.player_id]?.full_name +
                          " " +
                          allplayers[op.player_id]?.team || "FA",
                    colSpan: 3,
                    className: "left " + className,
                    image: {
                      src: op.player_id,
                      alt: "headshot",
                      type: "player",
                    },
                  },
                  {
                    text: op.score?.toFixed(2) || "-",
                    className: className,
                    colSpan: 2,
                  },
                ],
              };
            })
          : Array.from(
              new Set(
                activeWeeks.flatMap((week_key) =>
                  weeklyResults[week_key]?.[
                    roster.roster_id
                  ]?.optimal_lineup.map((op) => op.player_id)
                )
              )
            )
              ?.sort((a, b) => getFpPlayer(b) - getFpPlayer(a))
              ?.map((player_id) => {
                const fp_player = getFpPlayer(player_id);
                const fp_player_total = getFpPlayer(player_id, true);

                const className = players_left?.includes(player_id)
                  ? ""
                  : "red";
                return {
                  id: player_id,
                  list: [
                    {
                      text: allplayers[player_id]?.position,
                      className: className,
                      colSpan: 1,
                    },
                    {
                      text:
                        allplayers[player_id]?.full_name +
                        " " +
                        allplayers[player_id]?.team,
                      colSpan: 3,
                      className: "left " + className,
                      image: {
                        src: player_id,
                        alt: "headshot",
                        type: "player",
                      },
                    },
                    {
                      text: fp_player.toFixed(2),
                      className: className,
                      colSpan: 1,
                    },
                    {
                      text: (fp_player_total - fp_player).toFixed(2),
                      className: className,
                      colSpan: 1,
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
            text:
              getPlayersLeft(roster.roster_id, true)?.length?.toString() || "-",
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

  const players_list = league.rosters?.flatMap((roster) =>
    Array.from(
      new Set(
        activeWeeks.flatMap((week_key) =>
          weeklyResults[week_key]?.[roster.roster_id]?.optimal_lineup.map(
            (op) => op.player_id
          )
        )
      )
    )?.map((player_id) => {
      return {
        id: player_id,
        text: allplayers[player_id]?.full_name,
        image: { src: player_id, alt: "player", type: "player" },
      };
    })
  );

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
      <br />
      <br />
      <Search
        list={players_list}
        searched={searched}
        setSearched={setSearched}
        placeholder={"Players"}
      />
      <FilterIcons
        type={"position"}
        filterPosition={filterPosition}
        setFilterPosition={setFilterPosition}
      />
      <FilterIcons
        type={"team"}
        filterTeam={filterTeam}
        setFilterTeam={setFilterTeam}
      />
      <br />
      <br />
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
