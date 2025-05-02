const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authController = require('../controllers/auth');
const { checkRole } = require('../middleware/roleMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg, .jpeg, and .pdf files are allowed'));
    }
});

// Middleware to verify JWT token
router.use(authController.verifyToken);

// Student routes
router.post('/submit', 
    checkRole(['student']),
    upload.fields([
        { name: 'selfie', maxCount: 1 },
        { name: 'document', maxCount: 1 }
    ]),
    applicationController.createApplication
);

router.get('/status', 
    checkRole(['student']),
    applicationController.getApplicationStatus
);

// Approver routes
router.get('/all', 
    checkRole(['approver']),
    applicationController.getAllApplications
);

router.put('/:applicationId/status', 
    checkRole(['approver']),
    applicationController.updateApplicationStatus
);

module.exports = router; 