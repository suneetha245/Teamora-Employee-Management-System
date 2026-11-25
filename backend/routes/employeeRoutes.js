const router = require('express').Router();
const c = require('../controllers/employeeController');
const { protect, hrOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Employees can read only their own record (enforced in the controller); everything else is HR-only.
router.get('/:id', c.getEmployee);

router.use(hrOnly);
router.route('/').get(c.listEmployees).post(upload.single('photo'), c.createEmployee);
router.route('/:id').put(upload.single('photo'), c.updateEmployee).delete(c.deleteEmployee);
router.post('/:id/reset-password', c.resetPassword);

module.exports = router;
