const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    selfiePath: {
        type: String,
        required: true
    },
    documentType: {
        type: String,
        enum: ['Driving Licence', 'PAN Card', 'Aadhaar Card'],
        required: true
    },
    proofOfAddressPath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    // Reference to the student who submitted the application
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Optional fields for rejection or approval
    remarks: {
        type: String,
        default: ''
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
