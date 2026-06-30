const bcrypt = require('bcryptjs');

bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Hash for admin123:', hash);
});
