var express = require('express');
var goods = require('../controllers/goods');


var router = express.Router();

router.get('/', goods.home);
router.post('/catch', goods.catch);
router.get('/commentImg', goods.commentImgGet);
router.post('/commentImg', goods.commentImgPost);
router.get('/commentText', goods.commentTextGet);
router.post('/commentText', goods.commentTextPost);
router.get('/userImg', goods.userImgGet);
router.post('/userImg', goods.userImgPost);

module.exports = router;