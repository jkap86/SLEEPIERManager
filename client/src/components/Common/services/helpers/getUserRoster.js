export const getUserRoster = (rosters, user_id) => {
    return rosters
        ?.find(r => r.user_id === user_id || r.co_owners?.find(co => co?.user_id === user_id))
}

