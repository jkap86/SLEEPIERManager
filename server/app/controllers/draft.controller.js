"use strict";

const db = require("../models");
const League = db.leagues;
const Draft = db.drafts;
const Draftpick = db.draftpicks;
const sequelize = db.sequelize;
const Op = db.Sequelize.Op;

exports.adp = async (req, res) => {
  try {
    const draft_picks = await Draftpick.findAll({
      attributes: [
        "player_id",
        "league_type",
        [sequelize.fn("AVG", sequelize.col("pick_no")), "adp"],
        [sequelize.fn("COUNT", sequelize.col("draft.draft_id")), "n_drafts"],
      ],
      include: {
        model: Draft,
        attributes: [],
        include: {
          model: League,
          attributes: [],
          where: {
            league_id: req.body.league_ids,
          },
        },
        required: true,
      },
      group: ["player_id", "draftpick.league_type"],
    });
    console.log({ length: draft_picks.length });
    res.send(draft_picks);
  } catch (err) {
    console.log(err.message);
  }
};

exports.playercomp = async (req, res) => {
  try {
    const list1 = await Draftpick.findAll({
      attributes: ["picked_by"],
      where: {
        [Op.and]: [
          {
            player_id: req.body.player1,
          },
          {
            picked_by: req.body.lm_user_ids,
          },
        ],
      },
      include: {
        model: Draft,
        attributes: [],
        include: {
          attributes: [],
          model: Draftpick,
          where: {
            player_id: req.body.player2,
            pick_no: {
              [Op.gt]: sequelize.col("draftpick.pick_no"),
            },
          },
        },
        required: true,
      },
    });

    const list2 = await Draftpick.findAll({
      attributes: ["picked_by"],
      where: {
        [Op.and]: [
          {
            player_id: req.body.player2,
          },
          {
            picked_by: req.body.lm_user_ids,
          },
        ],
      },
      include: {
        model: Draft,
        attributes: [],
        include: {
          attributes: [],
          model: Draftpick,
          where: {
            player_id: req.body.player1,
            pick_no: {
              [Op.gt]: sequelize.col("draftpick.pick_no"),
            },
          },
        },
        required: true,
      },
    });

    res.send({ list1, list2 });
  } catch (err) {
    console.log(err.message);
  }
};
