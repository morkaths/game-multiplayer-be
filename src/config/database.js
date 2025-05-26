import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a MySQL connection pool using environment variables
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test connection when server starts
const testConnection = async (retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.getConnection();
            console.log('Database connection has been established successfully.');
            connection.release();
            return;
        } catch (error) {
            console.error(`Unable to connect to the database (attempt ${i + 1}):`, error.message);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, delay));
            } else {
                process.exit(1); // Thoát nếu thử nhiều lần vẫn không được
            }
        }
    }
};

testConnection();

export default pool;