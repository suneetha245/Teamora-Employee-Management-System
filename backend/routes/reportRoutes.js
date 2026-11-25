const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect, hrOnly } = require('../middleware/auth');

router.use(protect, hrOnly);
router.get('/summary', c.summary);
router.get('/employees', c.employeeReport);
router.get('/employees/export', c.exportEmployees);

module.exports = router;
