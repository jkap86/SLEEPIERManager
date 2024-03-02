import "./App.css";
import LoadingIcon from "./components/Common/LoadingIcon";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
const Homepage = lazy(() => import("./components/Homepage"));
const Players = lazy(() => import("./components/Players"));
const Leaguemates = lazy(() => import("./components/Leaguemates"));
const Trades = lazy(() => import("./components/Trades"));
const PickTracker = lazy(() => import("./components/Picktracker/picktracker"));
const PlayoffPool = lazy(() => import("./components/PlayoffPool/PlayoffPool"));
const Leagues = lazy(() => import("./components/Leagues"));
const Layout = lazy(() => import("./components/Common/Layout"));

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Suspense fallback={<LoadingIcon />}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route
              path="/leagues/:username"
              element={
                <Layout
                  display={
                    <Suspense fallback={<LoadingIcon />}>
                      <Leagues />
                    </Suspense>
                  }
                />
              }
            />
            <Route
              path="/players/:username"
              element={
                <Layout
                  display={
                    <Suspense fallback={<LoadingIcon />}>
                      <Players />
                    </Suspense>
                  }
                />
              }
            />
            <Route
              path="/leaguemates/:username"
              element={
                <Layout
                  display={
                    <Suspense fallback={<LoadingIcon />}>
                      <Leaguemates />
                    </Suspense>
                  }
                />
              }
            />
            <Route
              path="/trades/:username"
              element={
                <Layout
                  display={
                    <Suspense fallback={<LoadingIcon />}>
                      <Trades />
                    </Suspense>
                  }
                />
              }
            />
            <Route
              path="/picktracker/:league_id"
              element={
                <Suspense fallback={<LoadingIcon />}>
                  <PickTracker />
                </Suspense>
              }
            />
            <Route
              path="/playoffs/:league_id"
              element={
                <Suspense fallback={<LoadingIcon />}>
                  <PlayoffPool />
                </Suspense>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
