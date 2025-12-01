const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$rHqZlKm8wnT3LZzPPY.qKuXOX9wYGwX9QqQ8kQZK3qp0YL0YjZb0O';

bcrypt.compare(password, hash).then(res => {
    console.log(`Password '${password}' matches hash: ${res}`);
});
