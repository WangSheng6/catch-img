var express = require('express');
var duobao = require('../controllers/duobao');


var router = express.Router();

router.get('/', duobao.home);
router.get('/catch', duobao.catchGet);
router.post('/catch', duobao.catchPost);
router.get('/past', duobao.past);
router.get('/compare', duobao.compare);

module.exports = router;