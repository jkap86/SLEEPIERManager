"use strict";

const db = require("../models");
const League = db.leagues;
const Draft = db.drafts;
const Draftpick = db.draftpicks;
const sequelize = db.sequelize;

exports.adp = async (req, res) => {
  try {
    const draft_picks = await Draftpick.findAll({
      attributes: [
        "player_id",
        [sequelize.fn("AVG", sequelize.col("pick_no")), "average_pick_no"],
      ],
      group: ["player_id"],
    });

    res.send(draft_picks);
  } catch (err) {
    console.log(err.message);
  }
};
