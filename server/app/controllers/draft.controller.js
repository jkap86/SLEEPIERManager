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
        where: {
          [Op.and]: [
            {
              type: { [Op.not]: "auction" },
            },
            {
              [Op.or]: [
                {
                  [Op.and]: [
                    {
                      settings: {
                        slots_super_flex: 1,
                      },
                    },
                    {
                      settings: {
                        slots_qb: 1,
                      },
                    },
                  ],
                },
                {
                  settings: {
                    slots_qb: 2,
                  },
                },
                {
                  settings: {
                    slots_super_flex: 2,
                  },
                },
              ],
            },
            {
              settings: {
                slots_k: 1,
              },
            },
          ],
        },
        include: {
          model: League,
          attributes: [],
          where: {
            [Op.and]: [
              {
                league_id: req.body.league_ids,
              },
              {
                roster_positions: {
                  [Op.not]: {
                    [Op.contains]: ["K"],
                  },
                },
              },
            ],
          },
        },
        required: true,
      },
      group: ["player_id", "draftpick.league_type"],
    });

    res.send(draft_picks);
  } catch (err) {
    console.log(err.message);
  }
};
