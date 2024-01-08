"use strict";

const { fetchUser } = require("../api/sleeperApi");
const db = require("../models");
const User = db.users;
const League = db.leagues;

exports.upsert = async (req, res) => {
  console.log(`***SEARCHING FOR ${req.query.username}***`);

  let user;

  try {
    user = await fetchUser(req.query.username);
  } catch (error) {
    console.log(error.message);
  }

  if (user?.user_id) {
    const data = await User.upsert({
      user_id: user.user_id,
      username: user.display_name,
      avatar: user.avatar,
      type: "S", // S = 'Searched'
      updatedAt: new Date(),
    });

    const userData = data[0].dataValues;

    res.send({
      user: {
        user_id: userData.user_id,
        username: userData.username,
        avatar: userData.avatar,
      },
    });
  } else {
    res.send({ error: "User not found" });
  }
};

exports.lmplayershares = async (req, res) => {
  try {
    const lmplayershares = await User.findAll({
      attributes: ["user_id", "username", "avatar", "playershares"],
      include: [
        {
          model: League,
          attributes: [],
          include: {
            model: User,
            through: { attributes: [] },
            attributes: [],
            where: {
              user_id: req.query.user_id,
            },
          },
          required: true,
        },
      ],
    });

    res.send(lmplayershares);
  } catch (error) {
    console.log(error);
  }
};
