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
  column1: "ADP SF D",
  column2: "Auction Budget% D",
  column3: "Owned",
  column4: "Owned %",
  primaryContent: "All",
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
