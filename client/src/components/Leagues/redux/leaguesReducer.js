const initialState = {
  page: 1,
  itemActive: "",
  searched: "",
  tabSecondary: "Standings",
  column1: "Players Value (Auction Budget %)",
  column2: "Picks Value (Auction Budget %)",
  column3: "Total Value (Auction Budget %)",
  column4: "Total Value Rank (Auction Budget %)",
  primaryContent: "Records",
};

const leaguesReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_STATE_LEAGUES":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default leaguesReducer;
