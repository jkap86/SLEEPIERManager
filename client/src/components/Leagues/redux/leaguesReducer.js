const initialState = {
  page: 1,
  itemActive: "",
  searched: "",
  tabSecondary: "Standings",
  column1: "Auction Budget% D",
  column2: "Auction Budget% D Players",
  column3: "Auction Budget% D Picks",
  column4: "Open Roster",
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
