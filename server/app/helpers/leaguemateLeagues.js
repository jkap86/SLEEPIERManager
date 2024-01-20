"use strict";

const getLeaguemateLeagues = async (
  user_id,
  League,
  User,
  Op,
  type1,
  type2
) => {
  const filters = [];

  if (type1 === "Redraft") {
    filters.push({
      settings: {
        type: { [Op.not]: 2 },
      },
    });
  } else if (type1 === "Dynasty") {
    filters.push({
      settings: {
        type: 2,
      },
    });
  }

  if (type2 === "Bestball") {
    filters.push({
      settings: {
        best_ball: 1,
      },
    });
  } else if (type2 === "Lineup") {
    filters.push({
      settings: {
        best_ball: { [Op.not]: 1 },
      },
    });
  }

  const leaguemateLeagues = await League.findAll({
    attributes: ["league_id"],
    where: {
      [Op.and]: filters,
    },
    include: {
      model: User,
      through: { attributes: [] },
      attributes: ["user_id"],
      include: {
        model: League,
        through: { attributes: [] },
        attributes: [],
        include: {
          model: User,
          attributes: [],
          through: { attributes: [] },
          where: {
            user_id: user_id,
          },
        },
        required: true,
      },
      required: true,
    },
  });

  return leaguemateLeagues;
};

module.exports = {
  getLeaguemateLeagues: getLeaguemateLeagues,
};
