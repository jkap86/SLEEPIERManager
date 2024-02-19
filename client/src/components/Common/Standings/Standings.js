import TableMain from "../TableMain";
import { useDispatch, useSelector } from "react-redux";
import Roster from "../Roster";
import { useEffect, useState } from "react";
import { setStateCommon } from "../redux/actions";
import { getAdpFormatted } from "../services/helpers/getAdpFormatted";
import "./Standings.css";

const Standings = ({
  league,
  trade_value_date,
  current_value_date,
  type,
  expandRoster,
}) => {
  const dispatch = useDispatch();
  const { siteLinkIndex, allplayers } = useSelector((state) => state.common);
  const { adpLm } = useSelector((state) => state.user);
  const [itemActive2, setItemActive2] = useState("");
  const [filter, setFilter] = useState("All");
  const [ppgType, setPpgType] = useState("ADP");
  const [pageAvailable, setPageAvailable] = useState(1);

  const links = [
    {
      label: "Fantasy Football Ranker",
      href: `https://fantasyfootballranker.com/leaguerankings/?leagueId=${league.league_id}`,
    },
    {
      label: "Keep Trade Cut",
      href: `https://keeptradecut.com/dynasty/power-rankings/league-overview?leagueId=${league.league_id}&platform=2`,
    },
    {
      label: "Fantasy Calc",
      href: `https://fantasycalc.com/league/dashboard?leagueId=${league.league_id}&site=sleeper`,
    },
  ];

  useEffect(() => {
    if (league.userRoster) {
      setItemActive2(league.userRoster.roster_id);
    }
  }, [league]);

  useEffect(() => {
    if (itemActive2?.id && filter === "Picks") {
      setFilter("All");
    }
  });

  const active_roster = league.rosters.find((x) => x.roster_id === itemActive2);

  const standings = league.rosters
    ?.map((roster) => {
      return {
        roster_id: roster.roster_id,
        username: roster.username,
        avatar: roster.avatar,
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        ties: roster.settings.ties,
        fpts: parseFloat(
          roster.settings.fpts + "." + roster.settings.fpts_decimal
        ),
        fpts_against: parseFloat(
          roster.settings.fpts_against +
            "." +
            roster.settings.fpts_against_decimal
        ),
        budget_percent_players:
          roster.players?.reduce(
            (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
            0
          ) || 0,
        budget_percent_picks:
          roster.draft_picks?.reduce(
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
          ) || 0,
        budget_percent_starters:
          roster.starters?.reduce(
            (acc, cur) => acc + (adpLm?.["Dynasty_auction"]?.[cur]?.adp || 0),
            0
          ) || 0,
      };
    })
    ?.sort(
      (a, b) =>
        b.budget_percent_players +
        b.budget_percent_picks -
        (a.budget_percent_players + a.budget_percent_picks)
    );

  const standings_headers = [
    [
      {
        text: (
          <i
            className="fa-solid fa-circle-left"
            onClick={() =>
              dispatch(
                setStateCommon({
                  siteLinkIndex:
                    siteLinkIndex === 0 ? links.length - 1 : siteLinkIndex - 1,
                })
              )
            }
          ></i>
        ),
        colSpan: 1,
        className: "half",
      },
      {
        text: (
          <a
            className="external_link"
            target="_blank"
            href={links[siteLinkIndex]?.href}
          >
            {links[siteLinkIndex]?.label}
          </a>
        ),
        colSpan: 9,
        className: "half",
      },
      {
        text: (
          <i
            className="fa-solid fa-circle-right"
            onClick={() =>
              dispatch(
                setStateCommon({
                  siteLinkIndex:
                    siteLinkIndex === links.length - 1 ? 0 : siteLinkIndex + 1,
                })
              )
            }
          ></i>
        ),
        colSpan: 1,
        className: "half",
      },
    ],
    [
      {
        text: "Manager",
        colSpan: 5,
        className: "half",
      },
      {
        text: "Players",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Picks",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Total",
        colSpan: 2,
        className: "half",
      },
    ],
  ];

  const standings_body = standings?.map((team, index) => {
    return {
      id: team.roster_id,
      list: [
        {
          text: team.username || "Orphan",
          colSpan: 5,
          className: "left",
          image: {
            src: team.avatar,
            alt: "user avatar",
            type: "user",
          },
        },
        {
          text: team.budget_percent_players?.toFixed(0) + "%" || "-",
          colSpan: 2,
        },
        {
          text: team.budget_percent_picks?.toFixed(0) + "%" || "-",
          colSpan: 2,
        },
        {
          text:
            (team.budget_percent_picks + team.budget_percent_players)?.toFixed(
              0
            ) + "%" || "-",
          colSpan: 2,
        },
      ],
    };
  });

  const leagueInfo_headers = [
    [
      {
        text: (
          <select onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>QB</option>
            <option>RB</option>
            <option>WR</option>
            <option>TE</option>
          </select>
        ),
        colSpan: 4,
        className: "half",
      },
      {
        text: <p className="">Available</p>,
        colSpan: 15,
        className: "half",
      },
      {
        text: (
          <select onChange={(e) => setPpgType(e.target.value)}>
            <option>ADP</option>
            <option>Total</option>
            <option>In Lineup</option>
            <option>On Bench</option>
          </select>
        ),
        colSpan: 9,
        className: "half",
      },
    ],
    [
      {
        text: "Slot",
        colSpan: 4,
        className: "half",
      },
      {
        text: "Player",
        colSpan: 15,
        className: "half",
      },
      {
        text: ppgType === "ADP" ? "Draft" : "PPG",
        colSpan: 5,
        className: "half",
      },
      {
        text: ppgType === "ADP" ? "Auction" : "#",
        colSpan: 4,
        className: "half end",
      },
    ],
  ];

  const leagueInfo_body = Object.keys(allplayers)
    .filter(
      (player_id) =>
        !league.rosters?.find((roster) =>
          roster.players?.includes(player_id)
        ) &&
        (league.settings.status === "in_season" ||
          allplayers[player_id]?.years_exp > 0) &&
        (filter === "All" || filter === allplayers[player_id]?.position)
    )
    .sort(
      (a, b) =>
        (adpLm?.Dynasty?.[a]?.adp || 999) - (adpLm?.Dynasty?.[b]?.adp || 999)
    )
    .map((player_id) => {
      return {
        id: player_id,
        list: [
          {
            text: allplayers[player_id]?.position,
            colSpan: 4,
          },

          {
            text: allplayers[player_id]?.full_name || "-",
            colSpan: 15,
            className: "left",
            image: {
              src: player_id,
              alt: "player headshot",
              type: "player",
            },
          },
          {
            text:
              (adpLm?.["Dynasty"]?.[player_id]?.adp &&
                getAdpFormatted(adpLm?.["Dynasty"]?.[player_id]?.adp)) ||
              "-",
            colSpan: 5,
          },
          {
            text:
              (adpLm?.["Dynasty_auction"]?.[player_id]?.adp?.toFixed(0) ||
                "0") + "%",
            colSpan: 4,
          },
        ],
      };
    });

  return (
    <>
      {expandRoster ? (
        ""
      ) : (
        <TableMain
          type={type + " half"}
          headers={standings_headers}
          body={standings_body}
          itemActive={itemActive2}
          setItemActive={(value) => setItemActive2(value)}
        />
      )}
      {active_roster ? (
        <Roster
          type={type + (expandRoster ? "" : " half")}
          league={league}
          roster={active_roster}
          module={"Leagues"}
          trade_value_date={trade_value_date}
          current_value_date={current_value_date}
        />
      ) : (
        <TableMain
          type={type + " half"}
          headers={leagueInfo_headers}
          body={leagueInfo_body}
          page={pageAvailable}
          setPage={setPageAvailable}
        />
      )}
    </>
  );
};

export default Standings;
