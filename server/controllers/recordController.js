const HealthRecord = require('../models/HealthRecord');
const fs = require('fs');
const path = require('path');

// @desc    Get user health records (with search/filter)
// @route   GET /api/records
// @access  Private
exports.getRecords = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { user: req.user.id };

    // Apply category filter if provided
    if (category && category !== 'All') {
      query.category = category;
    }

    // Apply text search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const records = await HealthRecord.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create new health record
// @route   POST /api/records
// @access  Private
exports.createRecord = async (req, res) => {
  try {
    const { name, category, date, notes } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Please provide record name' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a file' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const record = await HealthRecord.create({
      user: req.user.id,
      name,
      category: category || 'Other',
      date: date || new Date(),
      fileUrl,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete health record
// @route   DELETE /api/records/:id
// @access  Private
exports.deleteRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    // Verify owner
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    // Delete associated file if it exists
    if (record.fileUrl) {
      const filePath = path.join(__dirname, '../..', record.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await record.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
