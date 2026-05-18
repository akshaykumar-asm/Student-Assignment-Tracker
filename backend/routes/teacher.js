const express = require('express');
const multer = require('multer');
const path = require('path');
const teacherController = require('../controllers/teacherController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/assignments'));
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
router.use(requireRole('teacher'));

router.get('/dashboard', teacherController.getDashboardData);
router.get('/assignments', teacherController.getAssignments);
router.post('/create-assignment', upload.single('file'), teacherController.createAssignment);
router.put('/update-assignment/:id', teacherController.updateAssignment);
router.get('/submitted-students/:assignmentId', teacherController.getSubmittedStudents);
router.get('/pending-students/:assignmentId', teacherController.getPendingStudents);
router.get('/download-submission/:submissionId', teacherController.downloadSubmission);
router.get('/download-assignment/:assignmentId', teacherController.downloadAssignment);
router.put('/grade-submission/:submissionId', teacherController.gradeSubmission);
router.get('/submission-details/:submissionId', teacherController.getSubmissionDetails);
router.put('/set-extension/:assignmentId', teacherController.setExtensionDeadline);

module.exports = router;
