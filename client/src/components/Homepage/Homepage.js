import { Link } from "react-router-dom";
import { useEffect } from "react";
import thelablogo from "../../images/thelab.png";
import { useDispatch, useSelector } from "react-redux";
import { setStateHome } from "./redux/actions";
import { resetState } from "../Common/redux/actions";
import "./Homepage.css";

const Homepage = () => {
  const dispatch = useDispatch();
  const { username_searched, leagueId, tab } = useSelector(
    (state) => state.homepage
  );

  useEffect(() => {
    dispatch(resetState());
  }, []);

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

  return (
    <div id="homepage">
      <div className="sh_nav">
        {nav_items.map((nav_item) => {
          return (
            <a
              key={nav_item.text}
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
      <div className="picktracker">
        <p
          className="home click"
          onClick={() =>
            dispatch(
              setStateHome({
                tab: tab === "username" ? "picktracker" : "username",
              })
            )
          }
        >
          picktracker
        </p>
        {tab === "picktracker" ? (
          <>
            <input
              onChange={(e) =>
                dispatch(setStateHome({ leagueId: e.target.value }))
              }
              className="picktracker"
              placeholder="League ID"
            />
            <Link className="home" to={`/picktracker/${leagueId.trim()}`}>
              Submit
            </Link>
          </>
        ) : null}
      </div>

      <div className="home_wrapper">
        <img alt="sleeper_logo" className="home" src={thelablogo} />
        <div className="home_title">
          <strong className="home">The Lab</strong>
          <div>
            <div className="user_input">
              <input
                className="home"
                type="text"
                placeholder="Username"
                onChange={(e) =>
                  dispatch(setStateHome({ username_searched: e.target.value }))
                }
              />
            </div>
            <a
              className="link click"
              onClick={(e) =>
                (window.location.href = `${window.location.protocol}//${
                  window.location.hostname +
                  (window.location.port && `:${window.location.port}`)
                }/${
                  localStorage.getItem("navTab") || "players"
                }/${username_searched}`)
              }
            >
              Submit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
