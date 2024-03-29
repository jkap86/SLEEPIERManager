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

export const getAdjustedRosterPlayers = (
  players,
  adds,
  drops,
  cutoff_start,
  cutoff_end,
  league_id
) => {
  const players_to_add = (adds || [])
    .filter(
      (add) =>
        (add.timestamp > cutoff_start && add.timestamp < cutoff_end) ||
        (add.type === "commissioner" && league_id === "1052969257388146688")
    )
    .map((add) => add.player_id);

  const players_added_after = (adds || [])
    .filter((add) => add.timestamp > cutoff_end && add.type !== "commissioner")
    .map((add) => add.player_id);

  const players_dropped_after = (drops || [])
    .filter((drop) => drop.timestamp > cutoff_end)
    .map((drop) => drop.player_id);

  let players_adjusted = Array.from(
    new Set([...players, ...players_to_add, ...players_dropped_after])
  );

  return players_adjusted.filter(
    (player_id) => !players_added_after.includes(player_id)
  );
};

export const getWeeklyResult = (
  league_id,
  rosters,
  roster_slots,
  scoring_settings,
  schedule_week,
  stats_week,
  allplayers,
  adds,
  drops,
  cutoff_start,
  cutoff_end
) => {
  const standings = {};

  rosters?.forEach((roster) => {
    const players_w_adjustments = getAdjustedRosterPlayers(
      roster.players || [],
      adds[roster.roster_id],
      drops[roster.roster_id],
      cutoff_start,
      cutoff_end,
      league_id
    );
    const optimal_lineup =
      roster.players?.length > 0
        ? getOptimalLineup(
            players_w_adjustments,
            roster_slots,
            scoring_settings,
            schedule_week,
            stats_week,
            allplayers
          )
        : [];

    console.log({
      username: roster.username,
      adds: adds[roster.roster_id]?.map((x) => {
        return {
          ...x,
          date: new Date(x.timestamp),
        };
      }),
    });

    const fp = optimal_lineup
      .filter((slot) => Object.keys(position_map).includes(slot.slot))
      .reduce((acc, cur) => acc + (cur.score || 0), 0);

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
            parseInt(t.score) >=
              parseInt(m.team.find((t2) => t.id !== t2.id).score))
      )
    )
      ? true
      : false;

    const advanced = schedule_week.find((m) =>
      m.team.find(
        (t) =>
          matchTeam(t.id) === allplayers[player_id]?.team &&
          m.gameSecondsRemaining === "0" &&
          parseInt(t.score) >=
            parseInt(m.team.find((t2) => t.id !== t2.id).score)
      )
    )
      ? true
      : false;

    const in_progress = schedule_week.find((m) =>
      m.team.find(
        (t) =>
          matchTeam(t.id) === allplayers[player_id]?.team &&
          parseInt(m.gameSecondsRemaining) > 0 &&
          (parseInt(m.gameSecondsRemaining) < 3600 ||
            parseInt(m.kickoff) * 1000 < new Date().getTime())
      )
    )
      ? true
      : false;

    const player_stats =
      stats_week.find((s) => s.player_id === player_id) || {};
    return {
      player_id: player_id,
      playing: playing,
      in_progress: in_progress,
      advanced: advanced,
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
        (x) => x.player_id !== optimal_player?.player_id
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
