import TableMain from "../../Common/TableMain";
import { useSelector, useDispatch } from "react-redux";
import { setStateLeaguemates } from "../redux/actions";
import { filterLeagues } from "../../Common/services/helpers/filterLeagues";
import { getTrendColor } from "../../Common/services/helpers/getTrendColor";

const LeaguemateRecords = ({ secondaryTable }) => {
  const dispatch = useDispatch();
  const { username, type1, type2, leaguemates } = useSelector(
    (state) => state.user
  );
  const { page, itemActive, searched } = useSelector(
    (state) => state.leaguemates
  );

  console.log({ leaguemates });

  const leaguemates_headers = [
    [
      {
        text: "Leaguemate",
        colSpan: 3,
        rowSpan: 2,
      },
      {
        text: "#",
        colSpan: 1,
        rowSpan: 2,
      },
      {
        text: "Leaguemate",
        colSpan: 4,
        className: "half",
      },
      {
        text: username,
        colSpan: 4,
        className: "half",
      },
    ],
    [
      {
        text: "Record",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Fpts",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Record",
        colSpan: 2,
        className: "half",
      },
      {
        text: "Fpts",
        colSpan: 2,
        className: "half",
      },
    ],
  ];

  const leaguemates_body = (leaguemates || [])
    ?.filter(
      (x) =>
        x.username !== username && (!searched?.id || searched.id === x.user_id)
    )
    ?.sort(
      (a, b) =>
        filterLeagues(b.leagues, type1, type2)?.length -
        filterLeagues(a.leagues, type1, type2)?.length
    )
    ?.map((lm) => {
      const lm_leagues = filterLeagues(lm.leagues, type1, type2);

      const lm_wins = lm_leagues?.reduce(
        (acc, cur) => acc + cur.lmRoster.settings?.wins,
        0
      );
      const lm_losses = lm_leagues?.reduce(
        (acc, cur) => acc + cur.lmRoster.settings?.losses,
        0
      );
      const lm_ties = lm_leagues?.reduce(
        (acc, cur) => acc + cur.lmRoster.settings.ties,
        0
      );
      const lm_winpct =
        lm_wins + lm_losses + lm_ties > 0 &&
        lm_wins / (lm_wins + lm_losses + lm_ties);
      const lm_fpts = lm.leagues?.reduce(
        (acc, cur) =>
          acc +
          parseFloat(
            cur.lmRoster.settings?.fpts +
              "." +
              cur.lmRoster.settings?.fpts_decimal
          ),
        0
      );

      const user_wins = lm_leagues?.reduce(
        (acc, cur) => acc + cur.userRoster.settings?.wins,
        0
      );
      const user_losses = lm_leagues?.reduce(
        (acc, cur) => acc + cur.userRoster.settings?.losses,
        0
      );
      const user_ties = lm_leagues?.reduce(
        (acc, cur) => acc + cur.userRoster.settings?.ties,
        0
      );
      const user_winpct =
        user_wins + user_losses + user_ties > 0 &&
        user_wins / (user_wins + user_losses + user_ties);
      const user_fpts = lm.leagues?.reduce(
        (acc, cur) =>
          acc +
          parseFloat(
            cur.userRoster.settings?.fpts +
              "." +
              cur.userRoster.settings?.fpts_decimal
          ),
        0
      );

      return {
        id: lm.user_id,
        search: {
          text: lm.username,
          image: {
            src: lm.avatar,
            alt: "user avatar",
            type: "user",
          },
        },
        list: [
          {
            text: lm.username || "Orphan",
            colSpan: 3,
            className: "left",
            image: {
              src: lm.avatar,
              alt: lm.username,
              type: "user",
            },
          },
          {
            text: lm_leagues?.length.toString(),
            colSpan: 1,
          },
          {
            text: (
              <p
                className={
                  lm_winpct > 0.5
                    ? "green stat"
                    : lm_winpct < 0.5
                    ? " red stat"
                    : "stat"
                }
                style={getTrendColor(lm_winpct - 0.5, 0.0005)}
              >
                {lm_wins}-{lm_losses}
                {lm_ties > 0 ? `-${lm_ties}` : ""}
              </p>
            ),
            colSpan: 2,
            className: "relative",
          },
          {
            text: (
              <p
                className={
                  lm_winpct > 0.5
                    ? "green stat"
                    : lm_winpct < 0.5
                    ? " red stat"
                    : "stat"
                }
                style={getTrendColor(lm_winpct - 0.5, 0.0005)}
              >
                {lm_fpts?.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}
              </p>
            ),
            colSpan: 2,
            className: "relative",
          },
          {
            text: (
              <p
                className={
                  user_winpct > 0.5
                    ? "green stat"
                    : user_winpct < 0.5
                    ? " red stat"
                    : "stat"
                }
                style={getTrendColor(user_winpct - 0.5, 0.0005)}
              >
                {user_wins}-{user_losses}
                {user_ties > 0 ? `-${user_ties}` : ""}
              </p>
            ),
            colSpan: 2,
            className: "relative",
          },
          {
            text: (
              <p
                className={
                  user_winpct > 0.5
                    ? "green stat"
                    : user_winpct < 0.5
                    ? " red stat"
                    : "stat"
                }
                style={getTrendColor(user_winpct - 0.5, 0.0005)}
              >
                {user_fpts?.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2,
                })}
              </p>
            ),
            colSpan: 2,
            className: "relative",
          },
        ],
        secondary_table: secondaryTable({ leaguemate: lm }),
      };
    });

  return (
    <TableMain
      id={"Leaguemates"}
      type={"primary"}
      headers={leaguemates_headers}
      body={leaguemates_body}
      page={page}
      setPage={(page) => dispatch(setStateLeaguemates({ page: page }))}
      itemActive={itemActive}
      setItemActive={(item) =>
        dispatch(setStateLeaguemates({ itemActive: item }))
      }
      search={true}
      searched={searched}
      setSearched={(searched) =>
        dispatch(setStateLeaguemates({ searched: searched }))
      }
    />
  );
};

export default LeaguemateRecords;
