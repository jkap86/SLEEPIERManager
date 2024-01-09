"use strict";

const axiosInstance = require("../api/axiosInstance");

const fetchScheduleWeek = async (week) => {
  const schedule_week = await axiosInstance.get(
    `https://api.myfantasyleague.com/fflnetdynamic2023/nfl_sched_${week}.json`
  );

  return schedule_week.data;
};

module.exports = {
  fetchScheduleWeek,
};
