import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "../Avatar";
import { useSelector, useDispatch } from "react-redux";
import { filterLeagues } from "../services/helpers/filterLeagues";
import { setStateUser } from "../redux/actions";
import "./Heading.css";
import { useEffect } from "react";

const Heading = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { progress } = useSelector((state) => state.progress);
  const { isLoadingLeagues, leagues, user_id, avatar, username, type1, type2 } =
    useSelector((state) => state.user);
  const { state } = useSelector((state) => state.common);

  const navTab = location.pathname.split("/")[1];

  useEffect(() => {
    localStorage.setItem("navTab", navTab);
  }, [navTab]);

  const filteredLeagueCount = isLoadingLeagues
    ? progress
    : filterLeagues(leagues || [], type1, type2)?.length;

  const nav_items = [
    {
      text: "South Harmon Home",
      link: "https://www.southharmonff.com/",
    },
    {
      text: "ADP",
      link: "https://www.southharmonff.com/adp",
    },
    {
      text: "WoRP",
      link: "https://www.southharmonff.com/worp",
    },
    {
      text: "Patreon",
      link: "https://www.patreon.com/SouthHarmon",
    },
    {
      text: "Articles",
      link: "https://www.southharmonff.com/articles",
    },
    {
      text: "Dynasty MindWoRPed",
      link: "https://www.southharmonff.com/mindworped",
    },
    {
      text: "Store",
      link: "https://www.southharmonff.com/store",
    },
    {
      text: "Team Reviews",
      link: "https://www.southharmonff.com/team-reviews",
    },
  ];

  return !user_id ? (
    ""
  ) : (
    <>
      <div className="sh_nav">
        {nav_items.map((nav_item) => {
          return (
            <a
              href={nav_item.link}
              target={
                !nav_item.link.includes("southharmonff.com")
                  ? "_blank"
                  : "_self"
              }
            >
              {nav_item.text}
            </a>
          );
        })}
      </div>
      <Link to="/" className="home">
        The Lab Home
      </Link>
      <div className="heading">
        <h1>{state?.league_season}</h1>
        <h1>
          <p className="image">
            {avatar && (
              <Avatar avatar_id={avatar} alt={username} type={"user"} />
            )}
            <strong>{username}</strong>
          </p>
        </h1>

        {navTab === "trades" ? null : (
          <div className="switch_wrapper">
            <div className="switch">
              <button
                className={type1 === "Redraft" ? "sw active click" : "sw click"}
                onClick={() => dispatch(setStateUser({ type1: "Redraft" }))}
              >
                Redraft
              </button>
              <button
                className={type1 === "All" ? "sw active click" : "sw click"}
                onClick={() => dispatch(setStateUser({ type1: "All" }))}
              >
                All
              </button>
              <button
                className={type1 === "Dynasty" ? "sw active click" : "sw click"}
                onClick={() => dispatch(setStateUser({ type1: "Dynasty" }))}
              >
                Dynasty
              </button>
            </div>
            <div className="switch">
              <button
                className={
                  type2 === "Bestball" ? "sw active click" : "sw click"
                }
                onClick={() => dispatch(setStateUser({ type2: "Bestball" }))}
              >
                Bestball
              </button>
              <button
                className={type2 === "All" ? "sw active click" : "sw click"}
                onClick={() => dispatch(setStateUser({ type2: "All" }))}
              >
                All
              </button>
              <button
                className={type2 === "Lineup" ? "sw active click" : "sw click"}
                onClick={() => dispatch(setStateUser({ type2: "Lineup" }))}
              >
                Lineup
              </button>
            </div>
          </div>
        )}
        <h2>{`${filteredLeagueCount} Leagues`}</h2>
        <div className="navbar">
          <p className="select">
            {navTab}&nbsp;<i className="fa-solid fa-caret-down"></i>
          </p>
          <select
            className="nav active click"
            value={navTab}
            onChange={(e) => {
              if (e.target.value === "trades") {
                window.location.href = `${window.location.protocol}//${
                  window.location.hostname +
                  (window.location.port && `:${window.location.port}`)
                }/${e.target.value}/${username}`;
              } else {
                navigate(`/${e.target.value}/${username}`);
              }
            }}
          >
            <option>players</option>
            <option>leagues</option>
            <option>leaguemates</option>
            <option>trades</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default Heading;
