"use strict";

const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Trade = sequelize.define(
    "trade",
    {
      transaction_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      status_updated: {
        type: DataTypes.BIGINT,
      },
      rosters: {
        type: Sequelize.JSONB,
      },
      adds: {
        type: Sequelize.JSONB,
      },
      drops: {
        type: Sequelize.JSONB,
      },
      draft_picks: {
        type: Sequelize.JSONB,
      },
      price_check: {
        type: Sequelize.JSONB,
      },
    },
    {
      /*
        indexes: [
            {
                fields: [{ attribute: 'status_updated', operator: 'DESC' }, 'managers', 'players', 'status_updated', 'leagueLeagueId'],


            }
        ]
        */
    }
  );

  return Trade;
};