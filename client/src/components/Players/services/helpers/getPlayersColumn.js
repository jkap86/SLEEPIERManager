import { getTrendColor } from "../../../Common/services/helpers/getTrendColor";

export const getPlayersColumn = (
  header,
  leagues_owned,
  leagues_taken,
  leagues_available,
  record,
  winpct,
  record_lm,
  winpct_lm
) => {
  switch (header) {
    case "Owned":
      return {
        text: leagues_owned?.length.toString(),
        colSpan: 1,
      };
    case "Owned %":
      return {
        text: (
          <em>
            {(
              (leagues_owned?.length /
                (leagues_owned.length +
                  leagues_available.length +
                  leagues_taken.length)) *
              100
            ).toFixed(0) + "%"}
          </em>
        ),
        colSpan: 1,
      };
    case "W/L":
      return {
        text: (
          <p className="stat" style={getTrendColor(winpct - 0.5, 0.0005)}>
            {record}
          </p>
        ),
        colSpan: 1,
      };
    case "W %":
      return {
        text: (
          <em>
            <p className="stat" style={getTrendColor(winpct - 0.5, 0.0005)}>
              {winpct}
            </p>
          </em>
        ),
        colSpan: 1,
      };
    case "LM W/L":
      return {
        text: (
          <p className="stat" style={getTrendColor(winpct_lm - 0.5, 0.0005)}>
            {record_lm}
          </p>
        ),
        colSpan: 1,
      };
    case "LM W %":
      return {
        text: (
          <em>
            <p className="stat" style={getTrendColor(winpct_lm - 0.5, 0.0005)}>
              {winpct_lm}
            </p>
          </em>
        ),
        colSpan: 1,
      };
    default:
      return {
        text: "-",
        colSpan: 1,
      };
  }
};
