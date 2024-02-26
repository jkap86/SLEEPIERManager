const initialState = {
  page: 1,
  itemActive: "",
  searched: "",
  tabSecondary: "Standings",
  column1: "Dynasty Picks Rank",
  column2: "Dynasty Players Rank",
  column3: "Dynasty Rank",
  column4: "Redraft Rank",
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
