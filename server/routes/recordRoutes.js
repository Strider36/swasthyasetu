const express = require('express');
const router = express.Router();
const { getRecords, createRecord, deleteRecord } = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // protect all routes

router.route('/')
  .get(getRecords)
  .post(upload.single('file'), createRecord);

router.route('/:id')
  .delete(deleteRecord);

module.exports = router;
