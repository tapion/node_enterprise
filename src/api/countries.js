const express = require('express');
const countriesService = require('../services/countriesService');

const router = express.Router();

router.route('/').get(countriesService.getcountries);
router.route('/:countryIso/cities').get(countriesService.citiesByCountry);

module.exports = router;
