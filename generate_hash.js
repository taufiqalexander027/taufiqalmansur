const bcrypt = require('bcryptjs');

const password = 'admin123';
bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
        console.log("New Hash:", hash);
    });
});
