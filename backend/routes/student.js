const express = require('express');
const multer = require('multer');
const path = require('path');
const studentController = require('../controllers/studentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/submissions'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({ storage, fileFilter });

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('student'));

router.get('/dashboard', studentController.getDashboardData);
router.get('/assignments', studentController.getAssignments);
router.get('/assignment/:assignmentId', studentController.getAssignmentDetails);
router.post('/submit-assignment', upload.single('file'), studentController.submitAssignment);
router.get('/download-assignment/:assignmentId', studentController.downloadAssignment);

module.exports = router;
