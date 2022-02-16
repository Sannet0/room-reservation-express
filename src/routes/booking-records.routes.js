const router = require('express').Router();
const bookingController = require('../controllers/booking-records.controller');

router.post('', bookingController.bookingRoom);
router.get('report/average-rooms-load', bookingController.averageRoomsLoadReport);

module.exports = router;
