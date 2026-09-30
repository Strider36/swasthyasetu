const SosRequest = require('../models/SosRequest');
const User = require('../models/User');

// Realistic Indian Healthcare Tier Facility Dataset
const DEMO_FACILITIES = [
  {
    id: 'fac-dh-01',
    name: 'District Civil Hospital',
    type: 'District Hospital (Tertiary & Trauma)',
    address: 'Station Road, District HQ',
    latitude: 18.5204,
    longitude: 73.8567,
    services: ['24x7 Emergency', 'ICU', 'Trauma Care', 'Blood Bank', 'Advanced Surgery', 'Ambulance Fleet'],
    phone: '020-26127394',
    openHours: '24 Hours Open'
  },
  {
    id: 'fac-sdh-02',
    name: 'Sub-District Hospital (SDH)',
    type: 'Sub-District Hospital (Secondary Care)',
    address: 'Old Pune-Nagar Highway, Taluka Centre',
    latitude: 18.8256,
    longitude: 74.3789,
    services: ['Emergency Care', 'Inpatient Ward', 'Minor OT', 'Laboratory', 'Maternity Care'],
    phone: '02138-222102',
    openHours: '24 Hours Open'
  },
  {
    id: 'fac-chc-03',
    name: 'Community Health Centre (CHC)',
    type: 'Community Health Centre (Rural Block)',
    address: 'Near Panchayat Samiti, Rural Block',
    latitude: 19.2064,
    longitude: 73.8763,
    services: ['Emergency Stabilization', 'Maternity & Child Health', 'Pharmacy', 'Basic Diagnostic'],
    phone: '02132-222045',
    openHours: '24 Hours Open'
  },
  {
    id: 'fac-phc-04',
    name: 'Primary Health Centre (PHC)',
    type: 'Primary Health Centre (Village Cluster)',
    address: 'Market Yard Road, Gram Panchayat',
    latitude: 19.1219,
    longitude: 73.9742,
    services: ['First Aid & Outpatient', 'Oral Dehydration', 'Fever Clinic', 'Referral Transport'],
    phone: '02132-242100',
    openHours: '8:00 AM - 8:00 PM (Emergency on-call)'
  }
];

// Controlled Demo Ambulance Fleet
const DEMO_AMBULANCES = [
  {
    id: 'amb-a01',
    vehicleNumber: 'MH 12 QX 4521',
    driverName: 'Rajesh Patil',
    phone: '+91 98230 11221',
    type: 'Advanced Life Support (ALS)',
    baseFacility: 'District Civil Hospital',
    available: true
  },
  {
    id: 'amb-a02',
    vehicleNumber: 'MH 14 TC 7890',
    driverName: 'Suresh Deshmukh',
    phone: '+91 98220 33442',
    type: 'Basic Life Support (BLS)',
    baseFacility: 'Community Health Centre (CHC)',
    available: true
  },
  {
    id: 'amb-a03',
    vehicleNumber: 'MH 12 RN 1102',
    driverName: 'Amit Shinde',
    phone: '+91 98210 55663',
    type: 'Patient Transport Vehicle (PTV)',
    baseFacility: 'Primary Health Centre (PHC)',
    available: true
  }
];

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0; // fallback reasonable estimate
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

// @desc    Create new SOS request
// @route   POST /api/sos
// @access  Public / Private (attaches user if logged in)
exports.createSos = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      locationAddress,
      emergencyType,
      description,
      destinationFacilityId,
      isOfflineQueued,
      patientPhone
    } = req.body;

    const patientId = req.user ? req.user._id : null;
    let patientName = req.user ? req.user.name : 'Emergency Caller';
    const contactPhone = patientPhone || (req.user && req.user.phone ? req.user.phone : '');

    // Identify destination facility
    let destination = null;
    if (destinationFacilityId) {
      destination = DEMO_FACILITIES.find(f => f.id === destinationFacilityId);
    }
    if (!destination) {
      // Pick closest facility or default to District Hospital
      if (latitude && longitude) {
        const sorted = [...DEMO_FACILITIES].map(f => ({
          ...f,
          distanceKm: calculateDistance(latitude, longitude, f.latitude, f.longitude)
        })).sort((a, b) => a.distanceKm - b.distanceKm);
        destination = sorted[0];
      } else {
        destination = DEMO_FACILITIES[0];
      }
    }

    const distKm = destination && latitude && longitude 
      ? calculateDistance(latitude, longitude, destination.latitude, destination.longitude) 
      : 4.8;

    // Pick a prototype ambulance for coordination demo
    const chosenAmbulance = DEMO_AMBULANCES[0];
    const initialEta = Math.max(5, Math.round(distKm * 2.5));

    // Ambulance simulated start position nearby
    const ambLat = latitude ? latitude + 0.015 : destination.latitude;
    const ambLng = longitude ? longitude + 0.012 : destination.longitude;

    const sos = await SosRequest.create({
      patient: patientId,
      patientName,
      patientPhone: contactPhone,
      latitude: latitude || null,
      longitude: longitude || null,
      locationAddress: locationAddress || 'GPS Coordinates Registered',
      emergencyType: emergencyType || 'Ambulance',
      description: description || 'Urgent medical assistance requested via Sanjeev Astra SOS',
      destinationFacility: {
        id: destination.id,
        name: destination.name,
        type: destination.type,
        address: destination.address,
        distanceKm: distKm,
        phone: destination.phone
      },
      ambulance: {
        id: chosenAmbulance.id,
        vehicleNumber: chosenAmbulance.vehicleNumber,
        driverName: chosenAmbulance.driverName,
        phone: chosenAmbulance.phone,
        etaMinutes: initialEta,
        currentLat: ambLat,
        currentLng: ambLng
      },
      status: 'REQUESTED',
      isOfflineQueued: !!isOfflineQueued,
      timeline: [
        {
          status: 'REQUESTED',
          timestamp: new Date(),
          note: isOfflineQueued ? 'Synchronized from local offline queue' : 'Initial emergency alert registered'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: sos,
      meta: {
        prototypeNotice: 'Prototype ambulance coordination • Demo ambulance availability',
        isOfflineQueued: !!isOfflineQueued
      }
    });
  } catch (error) {
    console.error('Error creating SOS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get SOS requests (RBAC: patients see own, health_worker/admin sees all)
// @route   GET /api/sos
// @access  Private
exports.getSosRequests = async (req, res) => {
  try {
    const isStaff = req.user.role === 'health_worker' || req.user.role === 'admin';
    let query = {};

    if (!isStaff) {
      query.patient = req.user._id;
    }

    const requests = await SosRequest.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      isStaff,
      data: requests
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current active SOS for authenticated patient
// @route   GET /api/sos/active
// @access  Private
exports.getActiveSos = async (req, res) => {
  try {
    const activeSos = await SosRequest.findOne({
      patient: req.user._id,
      status: { $in: ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] }
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: activeSos || null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single SOS request by ID
// @route   GET /api/sos/:id
// @access  Private
exports.getSosById = async (req, res) => {
  try {
    const sos = await SosRequest.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ success: false, error: 'SOS request not found' });
    }

    const isStaff = req.user.role === 'health_worker' || req.user.role === 'admin';
    if (!isStaff && (!sos.patient || !sos.patient.equals(req.user._id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this emergency record' });
    }

    res.status(200).json({
      success: true,
      data: sos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get patient SOS history
// @route   GET /api/sos/patient/:patientId
// @access  Private
exports.getPatientSosHistory = async (req, res) => {
  try {
    const isStaff = req.user.role === 'health_worker' || req.user.role === 'admin';
    if (!isStaff && req.user._id.toString() !== req.params.patientId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const history = await SosRequest.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: history.length, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update SOS status (REQUESTED -> ACCEPTED -> EN_ROUTE -> ARRIVED -> COMPLETED)
// @route   PATCH /api/sos/:id/status
// @access  Private (Staff or user simulation demo)
exports.updateSosStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['REQUESTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'CANCELLED', 'COMPLETED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }

    const sos = await SosRequest.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ success: false, error: 'SOS request not found' });
    }

    sos.status = status;
    sos.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status progressed to ${status}`
    });

    // If en route or arrived, adjust ETA
    if (status === 'ACCEPTED') {
      sos.ambulance.etaMinutes = Math.max(3, sos.ambulance.etaMinutes - 2);
    } else if (status === 'EN_ROUTE') {
      sos.ambulance.etaMinutes = 4;
    } else if (status === 'ARRIVED') {
      sos.ambulance.etaMinutes = 0;
    }

    await sos.save();

    res.status(200).json({
      success: true,
      data: sos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Cancel SOS request
// @route   POST /api/sos/:id/cancel
// @access  Private
exports.cancelSos = async (req, res) => {
  try {
    const sos = await SosRequest.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ success: false, error: 'SOS request not found' });
    }

    const isStaff = req.user.role === 'health_worker' || req.user.role === 'admin';
    if (!isStaff && (!sos.patient || !sos.patient.equals(req.user._id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to cancel this request' });
    }

    sos.status = 'CANCELLED';
    sos.timeline.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: req.body.reason || 'Request cancelled by user'
    });

    await sos.save();

    res.status(200).json({
      success: true,
      message: 'SOS request has been cancelled',
      data: sos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get nearby facilities with distance calculation
// @route   GET /api/sos/facilities/nearby
// @access  Public
exports.getNearbyFacilities = async (req, res) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat) : null;
    const lng = req.query.lng ? parseFloat(req.query.lng) : null;

    let facilities = DEMO_FACILITIES.map(f => {
      const distanceKm = lat && lng ? calculateDistance(lat, lng, f.latitude, f.longitude) : null;
      return {
        ...f,
        distanceKm
      };
    });

    if (lat && lng) {
      facilities.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get available prototype ambulances
// @route   GET /api/sos/ambulances/available
// @access  Public
exports.getAvailableAmbulances = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      notice: 'Prototype ambulance coordination • Demo ambulance availability',
      data: DEMO_AMBULANCES
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Assign ambulance to SOS
// @route   POST /api/sos/:id/assign-ambulance
// @access  Private (Staff only)
exports.assignAmbulance = async (req, res) => {
  try {
    const { ambulanceId } = req.body;
    const sos = await SosRequest.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ success: false, error: 'SOS request not found' });
    }

    const amb = DEMO_AMBULANCES.find(a => a.id === ambulanceId) || DEMO_AMBULANCES[0];
    sos.ambulance = {
      id: amb.id,
      vehicleNumber: amb.vehicleNumber,
      driverName: amb.driverName,
      phone: amb.phone,
      etaMinutes: 8,
      currentLat: (sos.latitude || 18.5204) + 0.01,
      currentLng: (sos.longitude || 73.8567) + 0.01
    };
    sos.status = 'ACCEPTED';
    sos.timeline.push({
      status: 'ACCEPTED',
      timestamp: new Date(),
      note: `Assigned ambulance ${amb.vehicleNumber} (Driver: ${amb.driverName})`
    });

    await sos.save();

    res.status(200).json({
      success: true,
      data: sos
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
