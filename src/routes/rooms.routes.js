const router = require('express').Router();
const roomController = require('../controllers/rooms.controller')

router.get('', roomController.nonOccupiedRooms);

module.exports = router;
