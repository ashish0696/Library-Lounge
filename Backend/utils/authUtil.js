const bcrypt = require('bcryptjs');

const hashPassword = async (plain) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plain, salt);
};

module.exports = { hashPassword };
