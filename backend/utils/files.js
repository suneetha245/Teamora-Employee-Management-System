const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

exports.UPLOAD_DIR = UPLOAD_DIR;
// Remove a stored upload given its public path (/uploads/<name>) or a multer file object.
exports.removeUpload = (ref) => {
  if (!ref) return;
  const name = path.basename(typeof ref === 'string' ? ref : ref.filename || '');
  if (!name) return;
  fs.unlink(path.join(UPLOAD_DIR, name), () => {});
};
