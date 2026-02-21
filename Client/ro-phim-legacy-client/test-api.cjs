const axios = require('axios');

async function test() {
    try {
        // Register an admin
        const email = 'admin' + Date.now() + '@example.com';
        await axios.post('http://localhost:8080/register', {
            first_name: 'Admin',
            last_name: 'Test',
            email: email,
            password: 'password',
            role: 'ADMIN',
            favourite_genres: []
        });

        // 1. Login to get token
        const loginRes = await axios.post('http://localhost:8080/login', {
            email: email,
            password: 'password'
        });
        const token = loginRes.data.token;
        console.log('Token acquired:', token.substring(0, 20) + '...');

        // 2. Patch review
        const patchRes = await axios.patch('http://localhost:8080/updatereview/tt0105695', {
            admin_review: 'This is a test review'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Patch success:', patchRes.status, patchRes.data);
    } catch (err) {
        if (err.response) {
            console.error('Patch failed. Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else {
            console.error('Request failed without response:', err.message);
        }
    }
}

test();
