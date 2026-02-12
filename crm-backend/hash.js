const bcrypt = require("bcryptjs");

const password = "Admin@123"; // change later
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log("Hashed Password:", hash);
