export const matchTeam = (team) => {
    const team_abbrev = {
        SFO: 'SF',
        JAC: 'JAX',
        KCC: 'KC',
        TBB: 'TB',
        GBP: 'GB',
        NEP: 'NE',
        LVR: 'LV',
        NOS: 'NO'
    }
    return team_abbrev[team] || team
}