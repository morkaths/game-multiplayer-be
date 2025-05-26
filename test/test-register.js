import fetch from 'node-fetch';

// Thông tin đăng ký test
const testUser = {
  username: "testuser",
  email: "test@example.com",
  password: "password123"
};

// URL API đăng ký
const REGISTER_URL = 'http://localhost:5000/api/auth/register';

// Gửi request đăng ký
async function testRegister() {
  try {
    const response = await fetch(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error testing register API:', error);
  }
}

// Chạy test
testRegister(); 