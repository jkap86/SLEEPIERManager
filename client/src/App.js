import "./App.css";
import Homepage from "./components/Homepage";
import LoadingIcon from "./components/Common/LoadingIcon";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import Leagues from "./components/Leagues";
import Players from "./components/Players";
import Leaguemates from "./components/Leaguemates";
import PickTracker from "./components/Picktracker/picktracker";
import PlayoffPool from "./components/PlayoffPool/PlayoffPool";
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
              element={<Layout display={<Leagues />} />}
            />
            <Route
              path="/players/:username"
              element={<Layout display={<Players />} />}
            />
            <Route
              path="/leaguemates/:username"
              element={<Layout display={<Leaguemates />} />}
            />
            <Route path="/picktracker/:league_id" element={<PickTracker />} />
            <Route path="/playoffs/:league_id" element={<PlayoffPool />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}

export default App;
