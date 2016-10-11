var express = require('express');
var aso = require('../controllers/aso');


var router = express.Router();

router.get('/', aso.homeGet);
router.post('/', aso.homePost);

module.exports = router;