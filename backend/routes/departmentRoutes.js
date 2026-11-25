const router = require('express').Router();
const c = require('../controllers/departmentController');
const { protect, hrOnly } = require('../middleware/auth');

router.use(protect, hrOnly);
router.route('/').get(c.listDepartments).post(c.createDepartment);
router.route('/:id').put(c.updateDepartment).delete(c.deleteDepartment);

module.exports = router;
