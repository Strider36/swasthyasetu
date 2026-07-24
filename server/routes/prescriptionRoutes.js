const express = require('express');
const router = express.Router();
const { getPrescriptions, createPrescription, deletePrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect); // protect all routes

router.route('/')
  .get(getPrescriptions)
  .post(upload.single('file'), createPrescription);

router.route('/:id')
  .delete(deletePrescription);

module.exports = router;
