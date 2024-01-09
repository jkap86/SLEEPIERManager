export const position_map = {
  QB: ["QB"],
  RB: ["RB", "FB"],
  WR: ["WR"],
  TE: ["TE"],
  FLEX: ["RB", "FB", "WR", "TE"],
  SUPER_FLEX: ["QB", "RB", "FB", "WR", "TE"],
  WRRB_FLEX: ["RB", "FB", "WR"],
  REC_FLEX: ["WR", "TE"],
};

export const position_abbrev = {
  QB: "QB",
  RB: "RB",
  WR: "WR",
  TE: "TE",
  SUPER_FLEX: "SF",
  FLEX: "WRT",
  WRRB_FLEX: "W R",
  WRRB_WRT: "W R",
  REC_FLEX: "W T",
};

export const matchTeam = (team) => {
  const team_abbrev = {
    SFO: "SF",
    JAC: "JAX",
    KCC: "KC",
    TBB: "TB",
    GBP: "GB",
    NEP: "NE",
    LVR: "LV",
    NOS: "NO",
  };

  return team_abbrev[team] || team;
};

export const getWeeklyResult = (
  rosters,
  roster_slots,
  scoring_settings,
  schedule_week,
  stats_week,
  allplayers
) => {
  const standings = {};

  rosters?.forEach((roster) => {
    const optimal_lineup =
      roster.players?.length > 0
        ? getOptimalLineup(
            roster.players,
            roster_slots,
            scoring_settings,
            schedule_week,
            stats_week,
            allplayers
          )
        : [];

    const fp = optimal_lineup
      .filter((slot) => Object.keys(position_map).includes(slot.slot))
      .reduce((acc, cur) => acc + cur.score, 0);

    standings[roster.roster_id] = {
      username: roster.username,
      avatar: roster.avatar,
      user_id: roster.user_id,
      roster_id: roster.roster_id,
      optimal_lineup: optimal_lineup,
      fp: fp,
    };
  });

  return standings;
};

export const getOptimalLineup = (
  players,
  roster_slots,
  scoring_settings,
  schedule_week,
  stats_week,
  allplayers
) => {
  const players_w_score = players.map((player_id) => {
    const playing = schedule_week.find((m) =>
      m.team.find(
        (t) =>
          matchTeam(t.id) === allplayers[player_id]?.team &&
          (m.gameSecondsRemaining !== "0" ||
            t.score >= m.team.find((t2) => t.id !== t2.id).score)
      )
    )
      ? true
      : false;

    const player_stats =
      stats_week.find((s) => s.player_id === player_id) || {};
    return {
      player_id: player_id,
      playing: playing,
      score: getPlayerScore([player_stats], scoring_settings, "stats", true),
    };
  });

  const starting_slots = roster_slots
    .filter((x) => Object.keys(position_map).includes(x))
    .map((slot, index) => {
      return {
        slot,
        index,
      };
    });

  const optimal_lineup = [];
  let players_w_score_remaining = players_w_score;

  starting_slots
    .sort(
      (a, b) =>
        (position_map[a.slot]?.length || 999) -
        (position_map[b.slot]?.length || 999)
    )
    .forEach((slot) => {
      const slot_options = players_w_score_remaining
        .filter(
          (player) =>
            position_map[slot.slot].includes(
              allplayers[player.player_id]?.position
            ) ||
            position_map[slot.slot].some((p) =>
              allplayers[player.player_id]?.fantasy_positions?.includes(p)
            )
        )
        .sort((a, b) => b.score - a.score);

      const optimal_player = slot_options[0];

      players_w_score_remaining = players_w_score_remaining.filter(
        (x) => x.player_id !== optimal_player.player_id
      );

      optimal_lineup.push({
        ...optimal_player,
        slot: slot.slot,
        slot_abbrev: position_abbrev[slot.slot],
      });
    });

  const bench = players_w_score_remaining.map((player) => {
    return {
      ...player,
      slot: "BN",
      slot_abbrev: "Bench",
    };
  });

  optimal_lineup.push(...bench);

  return optimal_lineup;
};

export const getPlayerScore = (
  stats_array,
  scoring_settings,
  type,
  total = false
) => {
  let total_breakdown = {};

  stats_array?.map((stats_game) => {
    Object.keys(stats_game?.[type] || {})
      .filter((x) => Object.keys(scoring_settings).includes(x))
      .map((key) => {
        if (!total_breakdown[key]) {
          total_breakdown[key] = {
            stats: 0,
            points: 0,
          };
        }
        total_breakdown[key] = {
          stats: total_breakdown[key].stats + stats_game[type][key],
          points:
            total_breakdown[key].points +
            stats_game[type][key] * scoring_settings[key],
        };
      });
  });

  return total
    ? Object.keys(total_breakdown).reduce(
        (acc, cur) => acc + total_breakdown[cur].points,
        0
      )
    : total_breakdown;
};
