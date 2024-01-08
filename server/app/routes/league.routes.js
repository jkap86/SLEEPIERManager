'use strict'

module.exports = (app) => {
    const router = require('express').Router();
    const league = require('../controllers/league.controller');


    router.get("/upsert", league.upsert);

    app.use('/league', router);
}