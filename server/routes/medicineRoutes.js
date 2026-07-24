const express = require('express');
const router = express.Router();
const { getMedicines, createMedicine, updateMedicine, deleteMedicine, logAdherence } = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // protect all routes in this router

router.route('/')
  .get(getMedicines)
  .post(createMedicine);

router.route('/:id')
  .put(updateMedicine)
  .delete(deleteMedicine);

router.route('/:id/log')
  .post(logAdherence);

module.exports = router;
