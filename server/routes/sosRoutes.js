const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const {
  createSos,
  getSosRequests,
  getActiveSos,
  getSosById,
  getPatientSosHistory,
  updateSosStatus,
  cancelSos,
  getNearbyFacilities,
  getAvailableAmbulances,
  assignAmbulance
} = require('../controllers/sosController');

// Optional protect middleware for createSos so both logged-in and urgent guest requests are supported
const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'swasthyasetu_super_secret_key_2026_jwt');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Proceed unauthenticated
    }
  }
  next();
};

// Facilities & Prototype Ambulances (Public discovery)
router.get('/facilities/nearby', getNearbyFacilities);
router.get('/ambulances/available', getAvailableAmbulances);

// Emergency SOS creation (supports authenticated or guest)
router.post('/', optionalProtect, createSos);

// Authenticated SOS management
router.get('/', protect, getSosRequests);
router.get('/active', protect, getActiveSos);
router.get('/:id', protect, getSosById);
router.get('/patient/:patientId', protect, getPatientSosHistory);
router.patch('/:id/status', protect, updateSosStatus);
router.post('/:id/cancel', protect, cancelSos);
router.post('/:id/assign-ambulance', protect, assignAmbulance);

module.exports = router;
