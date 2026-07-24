const express = require('express');
const router = express.Router();
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all routes

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .put(markAllRead);

router.route('/:id/read')
  .put(markRead);

module.exports = router;
