const initialState = {
    page: 1,
    itemActive: '',
    searched: '',
    tabSecondary: 'Standings',
    column1: 'Rank',
    column2: 'Trade Deadline',
    column3: 'Open Taxi',
    column4: 'Open Roster',
    primaryContent: 'Records'
}

const leaguesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_STATE_LEAGUES':
            return {
                ...state,
                ...action.payload
            };
        default:
            return state
    }
}

export default leaguesReducer;