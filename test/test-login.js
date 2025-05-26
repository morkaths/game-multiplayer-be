import fetch from 'node-fetch';

// URL API
const API_BASE = 'http://localhost:5000/api';
const LOGIN_URL = `${API_BASE}/auth/login`;
const PROTECTED_URL = `${API_BASE}/protected/user-content`;
const ADMIN_URL = `${API_BASE}/protected/admin-content`;

// Thông tin đăng nhập test
const loginData = {
  email: "test@example.com",
  password: "password123"
};

// Biến lưu token
let authToken = '';

// Test đăng nhập
async function testLogin() {
  try {
    console.log('Đang test API đăng nhập...');
    
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (data.token) {
      authToken = data.token;
      console.log('Auth token:', authToken);
      
      // Nếu đăng nhập thành công, test luôn protected route
      await testProtectedRoute();
    }
  } catch (error) {
    console.error('Error testing login API:', error);
  }
}

// Test protected route
async function testProtectedRoute() {
  try {
    console.log('\nĐang test protected route...');
    
    if (!authToken) {
      console.error('Không có token, cần đăng nhập trước');
      return;
    }
    
    const response = await fetch(PROTECTED_URL, {
      method: 'GET',
      headers: {
        'Authorization': authToken
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    // Test admin route
    await testAdminRoute();
  } catch (error) {
    console.error('Error testing protected API:', error);
  }
}

// Test admin route
async function testAdminRoute() {
  try {
    console.log('\nĐang test admin route...');
    
    if (!authToken) {
      console.error('Không có token, cần đăng nhập trước');
      return;
    }
    
    const response = await fetch(ADMIN_URL, {
      method: 'GET',
      headers: {
        'Authorization': authToken
      }
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error testing admin API:', error);
  }
}

// Chạy test
testLogin(); 