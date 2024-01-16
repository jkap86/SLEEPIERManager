"use strict";

const { fetchScheduleWeek } = require("../api/mflApi");
const { fetchStats } = require("../api/sleeperApi");
const fs = require("fs");

module.exports = async (app) => {
  if (process.env.NODE_ENV === "production") {
    setTimeout(async () => {
      const getSchedule = async (boot = false) => {
        const schedule_week = await fetchScheduleWeek(
          Math.max(app.get("state")?.week + 18, 19)
        );

        const schedule_json = fs.readFileSync("./data/schedule.json");

        fs.writeFileSync(
          "./data/schedule.json",
          JSON.stringify({
            ...JSON.parse(schedule_json),
            [schedule_week.nflSchedule.week]: schedule_week.nflSchedule.matchup,
          })
        );

        const games_in_progress = schedule_week.nflSchedule.matchup.find(
          (game) =>
            parseInt(game.gameSecondsRemaining) > 0 &&
            (parseInt(game.gameSecondsRemaining) < 3600 ||
              parseInt(game.kickoff) * 1000 < new Date().getTime())
        );

        console.log({ games_in_progress });

        let delay;
        let data;
        const stats_json = fs.readFileSync("./data/stats.json");

        if (games_in_progress?.kickoff || boot) {
          if (boot) {
            const stats = {};

            for (let i = 1; i <= schedule_week.nflSchedule.week - 18; i++) {
              const stats_week = await fetchStats("2023", i);

              stats[i + 18] = stats_week;
            }

            data = {
              ...JSON.parse(stats_json),
              ...stats,
            };
          } else {
            const stats_week = await fetchStats(
              "2023",
              Math.max(schedule_week.nflSchedule.week - 18, 1)
            );

            data = {
              ...JSON.parse(stats_json),
              [schedule_week.nflSchedule.week]: stats_week,
            };
          }
          fs.writeFileSync("./data/stats.json", JSON.stringify(data));

          const sec = new Date().getSeconds();

          delay = (60 - sec) * 1000;
        } else {
          const next_kickoff = Math.min(
            ...schedule_week.nflSchedule.matchup
              ?.filter((g) => parseInt(g.kickoff) * 1000 > new Date().getTime())
              ?.map((g) => parseInt(g.kickoff) * 1000)
          );

          console.log(schedule_week.nflSchedule.matchup);

          delay = next_kickoff - new Date().getTime();
        }

        const days_remainder = delay % (24 * 60 * 60 * 1000);
        const hours_remainder = days_remainder % (60 * 60 * 1000);

        console.log(
          `next update in
                    ${Math.floor(delay / (24 * 60 * 60 * 1000))} Days, 
                    ${Math.floor(days_remainder / (60 * 60 * 1000))} Hours, 
                    ${Math.floor(hours_remainder / (60 * 1000))} Min,
                `
        );
        setTimeout(() => {
          getSchedule();
        }, delay);
      };

      getSchedule(true);
    }, 5000);
  }
};
