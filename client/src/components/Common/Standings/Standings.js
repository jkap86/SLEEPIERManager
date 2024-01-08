import TableMain from "../TableMain";
import { useDispatch, useSelector } from "react-redux";
import Roster from "../Roster";
import { useEffect, useState } from "react";
import { setStateCommon } from "../redux/actions";

const Standings = ({ league, trade_value_date, current_value_date, type }) => {
  const dispatch = useDispatch();
  const { siteLinkIndex } = useSelector((state) => state.common);
  const [itemActive2, setItemActive2] = useState("");

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
      };
    })
    ?.sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);

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
        colSpan: 8,
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
        text: "Record",
        colSpan: 2,
        className: "half",
      },
      {
        text: "FP",
        colSpan: 3,
        className: "half",
      },
    ],
  ];

  const standings_body = standings?.map((team, index) => {
    const record = standings.find((s) => s.roster_id === team.roster_id);
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
          text: `${record.wins}-${record.losses}${
            record.ties > 0 ? `-${record.ties}` : ""
          }`,
          colSpan: 2,
        },
        {
          text: record.fpts.toLocaleString("en-US", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          }),
          colSpan: 3,
        },
      ],
    };
  });

  const leagueInfo_headers = [[]];

  const leagueInfo_body = [];
  return (
    <>
      <TableMain
        type={type + " half"}
        headers={standings_headers}
        body={standings_body}
        itemActive={itemActive2}
        setItemActive={(value) => setItemActive2(value)}
      />
      {active_roster ? (
        <Roster
          type={type + " half"}
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
        />
      )}
    </>
  );
};

export default Standings;
