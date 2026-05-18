const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/dashboard', adminController.getDashboardData);
router.get('/teachers', adminController.getTeachers);
router.get('/students', adminController.getStudents);
router.post('/add-teacher', adminController.addTeacher);
router.post('/add-student', adminController.addStudent);
router.put('/update-teacher/:id', adminController.updateTeacher);
router.put('/update-student/:id', adminController.updateStudent);
router.delete('/teacher/:id', adminController.deleteTeacher);
router.delete('/student/:id', adminController.deleteStudent);
router.post('/reset-password', adminController.resetPassword);
router.post('/update-user', adminController.updateUserDetails);

module.exports = router;
