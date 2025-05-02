const Application = require('../models/Application');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Create new application
exports.createApplication = async (req, res) => {
    console.log("Inside createApplication function");
    try {
        // Check if files were uploaded
        if (!req.files || !req.files.selfie || !req.files.document) {
            return res.status(400).json({
                success: false,
                message: 'Both selfie and document files are required'
            });
        }
        console.log("Hello from createApplication");
        const { fullName, email, phoneNumber, documentType } = req.body;
        const studentId = req.user.userId; // From JWT token

        // Validate required fields
        if (!fullName || !email || !phoneNumber || !documentType) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate document type
        const validDocumentTypes = ['Driving Licence', 'PAN Card', 'Aadhaar Card'];
        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type. Must be one of: Driving Licence, PAN Card, Aadhaar Card'
            });
        }

        // Check if application already exists for this student
        // const existingApplication = await Application.findOne({ studentId });
        // if (existingApplication) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Application already exists for this student'
        //     });
        // }
        const conflictApplication = await Application.findOne({
            $or: [
                { email: req.body.email },
                { phoneNumber: req.body.phoneNumber }
            ],
            studentId: { $ne: studentId }  // Different student
        });
        
        if (conflictApplication) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is already used by another student'
            });
        }
        
     
        const existingApplication = await Application.findOne({
            studentId,
            status: { $in: ['pending', 'approved'] }
        });
        
        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending or approved application'
            });
        }

       
        const selfieResult = await cloudinary.uploader.upload(req.files.selfie[0].path, {
            folder: 'kyc/selfies',
            resource_type: 'image'
        });

      
        const documentResult = await cloudinary.uploader.upload(req.files.document[0].path, {
            folder: 'kyc/documents',
            resource_type: 'auto' // auto-detect if it's PDF or image
        });

        // Create new application
        const newApplication = new Application({
            studentName: fullName,
            email,
            phoneNumber,
            selfiePath: selfieResult.secure_url,
            documentType: documentType,
            proofOfAddressPath: documentResult.secure_url,
            studentId,
            status: 'pending'
        });

        await newApplication.save();

        // Clean up uploaded files
        fs.unlinkSync(req.files.selfie[0].path);
        fs.unlinkSync(req.files.document[0].path);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                application: {
                    id: newApplication._id,
                    studentName: newApplication.studentName,
                    email: newApplication.email,
                    status: newApplication.status,
                    selfieUrl: newApplication.selfiePath,
                    documentUrl: newApplication.proofOfAddressPath
                }
            }
        });
    } catch (error) {
        console.error('Application creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error in application submission',
            error: error.message
        });
    }
};

// Get application status
exports.getApplicationStatus = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const application = await Application.find({ studentId });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'No application found'
            });
        }

        res.status(200).json({
            success: true,
            // data: {
            //     status: application.status,
            //     remarks: application.remarks,
            //     submittedAt: application.submittedAt
            // }
            application
        });
    } catch (error) {
        console.error('Get application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching application status',
            error: error.message
        });
    }
};

// Get all applications (for approvers)
exports.getAllApplications = async (req, res) => {
    try {
        if (req.user.userType !== 'approver') {
            return res.status(403).json({
                success: false,
                message: 'Only approvers can view all applications'
            });
        }

        const applications = await Application.find()
            .select('studentName email status submittedAt documentType selfiePath proofOfAddressPath')
            .sort({ submittedAt: -1 });
            console.log(applications);
        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('Get all applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};

// Update application status (for approvers)
exports.updateApplicationStatus = async (req, res) => {
    try {
        if (req.user.userType !== 'approver') {
            return res.status(403).json({
                success: false,
                message: 'Only approvers can update application status'
            });
        }

        const { applicationId } = req.params;
        const { status, remarks } = req.body;

        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;
        application.remarks = remarks;
        application.approvedBy = req.user.userId;
        application.approvedAt = new Date();

        await application.save();

        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            data: {
                status: application.status,
                remarks: application.remarks,
                approvedAt: application.approvedAt
            }
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating application status',
            error: error.message
        });
    }
};

// Export the upload middleware for use in routes
exports.upload = upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]); 