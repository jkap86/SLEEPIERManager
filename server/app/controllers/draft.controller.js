"use strict";

const db = require("../models");
const League = db.leagues;
const Draft = db.drafts;
const Draftpick = db.draftpicks;
const Auctionpick = db.auctionpicks;
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

    const auction_picks = await Auctionpick.findAll({
      attributes: [
        "player_id",
        "league_type",
        [sequelize.fn("AVG", sequelize.col("budget_percent")), "adp"],
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
      group: ["player_id", "auctionpick.league_type"],
    });

    res.send({ draft_picks, auction_picks });
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
      include: [
        {
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
      ],
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

exports.higher = async (req, res) => {
  const draftpicks = await Draftpick.findAll({
    attributes: ["player_id", "pick_no"],
    where: {
      [Op.and]: [
        {
          player_id: req.body.higher,
        },
      ],
    },
    include: {
      model: Draft,

      include: [
        {
          attributes: ["picked_by"],
          model: Draftpick,
          where: {
            [Op.and]: [
              { player_id: req.body.player },
              {
                pick_no: {
                  [Op.lt]: sequelize.col("draftpick.pick_no"),
                },
              },
              {
                picked_by: req.body.leaguemate_ids,
              },
            ],
          },
        },
        {
          model: League,
          attributes: ["league_id", "name"],
        },
      ],
      required: true,
    },
  });

  res.send(draftpicks);
};

exports.lower = async (req, res) => {
  const draftpicks = await Draftpick.findAll({
    attributes: ["player_id", "picked_by"],
    where: {
      [Op.and]: [
        {
          player_id: req.body.lower,
        },
        {
          picked_by: req.body.leaguemate_ids,
        },
      ],
    },
    include: {
      model: Draft,

      include: [
        {
          attributes: [],
          model: Draftpick,
          where: {
            [Op.and]: [
              { player_id: req.body.player },
              {
                pick_no: {
                  [Op.gt]: sequelize.col("draftpick.pick_no"),
                },
              },
            ],
          },
        },
        {
          model: League,
          attributes: ["league_id", "name"],
        },
      ],
      required: true,
    },
  });

  res.send(draftpicks);
};

exports.lm = async (req, res) => {
  const getLmPlayerPicks = async (player_id, higher) => {
    const lm_player_picks = await Draftpick.findAll({
      attributes: ["player_id", "pick_no"],
      where: {
        player_id: higher,
      },
      include: {
        model: Draft,

        include: [
          {
            attributes: ["picked_by", "player_id", "pick_no"],
            model: Draftpick,
            where: {
              [Op.and]: [
                { player_id: player_id },
                {
                  pick_no: {
                    [Op.lt]: sequelize.col("draftpick.pick_no"),
                  },
                },
                {
                  picked_by: req.body.lm_user_id,
                },
              ],
            },
          },
          {
            model: League,
            attributes: ["league_id", "name"],
          },
        ],
        required: true,
      },
    });

    return lm_player_picks;
  };

  const batchSize = 5;

  const results = [];

  console.log({ COUNT: req.body.higher.length });

  for (let i = 0; i < req.body.higher.length; i += batchSize) {
    console.log({ COUNTER: i });
    const results_batch = await Promise.all(
      req.body.higher.slice(i, i + batchSize).map(async (player_obj) => {
        const picks = await getLmPlayerPicks(
          player_obj.player_id,
          player_obj.higher
        );

        return picks;
      })
    );

    results.push(results_batch.flat());
  }

  res.send(results.flat(2));
};
