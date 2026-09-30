const mongoose = require('mongoose');

const SosRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  patientName: {
    type: String,
    default: 'Anonymous Patient'
  },
  patientPhone: {
    type: String,
    default: ''
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  locationAddress: {
    type: String,
    default: 'Location detected via GPS coordinates'
  },
  emergencyType: {
    type: String,
    enum: ['Ambulance', 'NearestHospital', 'MedicalHelp', 'EmergencyContact'],
    default: 'Ambulance'
  },
  description: {
    type: String,
    default: ''
  },
  destinationFacility: {
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: '' },
    address: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    phone: { type: String, default: '' }
  },
  ambulance: {
    id: { type: String, default: '' },
    vehicleNumber: { type: String, default: '' },
    driverName: { type: String, default: '' },
    phone: { type: String, default: '' },
    etaMinutes: { type: Number, default: 0 },
    currentLat: { type: Number, default: null },
    currentLng: { type: Number, default: null }
  },
  status: {
    type: String,
    enum: ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'CANCELLED', 'COMPLETED'],
    default: 'REQUESTED'
  },
  isOfflineQueued: {
    type: Boolean,
    default: false
  },
  timeline: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('SosRequest', SosRequestSchema);
