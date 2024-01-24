const initialState = {
  page: 1,
  itemActive: "",
  itemActive2: "",
  searched: "",
  filters: {
    position: "All",
    team: "All",
    draftClass: "All",
  },
  sortBy: "Owned",
  tabSecondary: "Owned",
  searchedSecondary: "",
  column1: "Owned",
  column2: "Owned %",
  column3: "ADP SF D",
  column4: "ADP SF R",
  primaryContent: "Records",
};

const playersReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_STATE_PLAYERS":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default playersReducer;
