import { useDispatch, useSelector } from "react-redux";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";
import { getTrendColor } from "../../Common/services/helpers/getTrendColor";
import { setState } from "../redux/actions";
import TableMain from "../../Common/TableMain";
import { getUserRoster } from "../../Common/services/helpers/getUserRoster";

const Records = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { user_id, leagues, type1, type2 } = useSelector((state) => state.user);
  const { page, itemActive, searched } = useSelector((state) => state.leagues);

  const leagues_headers = [
    [
      {
        text: "League",
        colSpan: 5,
      },
      {
        text: "W/L",
        colSpan: 2,
      },
      {
        text: "W %",
        colSpan: 2,
      },
      {
        text: "FP",
        colSpan: 2,
      },
      {
        text: "FPA",
        colSpan: 2,
      },
      {
        text: "Rank",
        colSpan: 2,
      },
    ],
  ];

  const body = filterLeagues(leagues, type1, type2).map((league) => {
    const rank = getUserRoster(league.rosters, user_id)?.rank;

    const record = {
      wins: league.userRoster.settings.wins,
      losses: league.userRoster.settings.losses,
      ties: league.userRoster.settings.ties,
      fpts: parseFloat(
        league.userRoster.settings.fpts +
          "." +
          league.userRoster.settings.fpts_decimal
      ),
      fpts_against: parseFloat(
        league.userRoster.settings.fpts_against +
          "." +
          league.userRoster.settings.fpts_against_decimal
      ),
    };

    return {
      id: league.league_id,
      search: {
        text: league.name,
        image: {
          src: league.avatar,
          alt: "league avatar",
          type: "league",
        },
      },
      list: [
        {
          text: league.name,
          colSpan: 5,
          className: "left",
          image: {
            src: league.avatar,
            alt: league.name,
            type: "league",
          },
        },
        {
          text:
            `${record?.wins?.toString() || ""}-${
              record?.losses?.toString() || ""
            }` +
            (league.userRoster.settings.ties > 0
              ? `-${league.userRoster.settings.ties}`
              : ""),
          colSpan: 2,
        },
        {
          text: (record?.wins + record?.losses > 0
            ? record?.wins / (record?.wins + record?.losses)
            : "-"
          ).toLocaleString("en-US", {
            maximumFractionDigits: 4,
            minimumFractionDigits: 4,
          }),
          colSpan: 2,
        },
        {
          text: record.fpts?.toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
          colSpan: 2,
        },
        {
          text: record.fpts_against?.toLocaleString("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }),
          colSpan: 2,
        },
        {
          text: (
            <p
              className={"stat check"}
              style={getTrendColor(
                -(rank / league.rosters.length - 0.5),
                0.0025
              )}
            >
              {rank || "-"}
            </p>
          ),
          colSpan: 2,
          className: "relative",
        },
      ],
      secondary_table: secondaryTable({ league }),
    };
  });

  const projectedRecord = filterLeagues(leagues || [], type1, type2).reduce(
    (acc, cur) => {
      const fp = parseFloat(
        cur.userRoster.settings.fpts +
          "." +
          cur.userRoster.settings.fpts_decimal
      );
      const fpa = parseFloat(
        cur.userRoster.settings.fpts_against ||
          0 + "." + cur.userRoster.settings.fpts_decimal ||
          0
      );

      return {
        wins: acc.wins + cur.userRoster.settings.wins,
        losses: acc.losses + cur.userRoster.settings.losses,
        ties: acc.ties + cur.userRoster.settings.ties,
        fpts: acc.fpts + fp,
        fpts_against: acc.fpts_against + fpa,
      };
    },
    {
      wins: 0,
      losses: 0,
      ties: 0,
      fpts: 0,
      fpts_against: 0,
    }
  );

  return (
    <>
      <h2>
        <table className="summary">
          <tbody>
            <tr>
              <th colSpan={2}>
                <span className="font2 wr">{"OVERALL RECORD"}</span>
              </th>
            </tr>
            <tr>
              <th>Record</th>
              <td>
                {projectedRecord?.wins.toLocaleString("en-US")}-
                {projectedRecord?.losses.toLocaleString("en-US")}
                {projectedRecord?.ties > 0 &&
                  `-${projectedRecord.ties.toLocaleString("en-US")}`}
              </td>
            </tr>
            <tr>
              <th>Win Pct</th>
              <td>
                {projectedRecord?.wins +
                  projectedRecord?.losses +
                  projectedRecord?.ties >
                0
                  ? (
                      (projectedRecord?.wins || 0) /
                      ((projectedRecord?.wins || 0) +
                        (projectedRecord?.losses || 0) +
                        (projectedRecord?.ties || 0))
                    ).toFixed(4)
                  : "-"}
              </td>
            </tr>
            <tr>
              <th>Points For</th>
              <td>
                {projectedRecord?.fpts?.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </td>
            </tr>
            <tr>
              <th>Points Against</th>
              <td>
                {projectedRecord?.fpts_against?.toLocaleString("en-US", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </h2>
      <TableMain
        id={"Leagues"}
        type={"primary"}
        headers={leagues_headers}
        body={body}
        page={page}
        setPage={(value) => dispatch(setState({ page: value }))}
        itemActive={itemActive}
        setItemActive={(value) => dispatch(setState({ itemActive: value }))}
        searched={searched}
        setSearched={(value) => dispatch(setState({ searched: value }))}
      />
    </>
  );
};

export default Records;
