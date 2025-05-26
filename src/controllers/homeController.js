import connection from '../config/database.js';

export const getHomePage = (req, res) => {
    let users = [];

    connection.query(
        'SELECT * FROM users',
        (error, results) => {
            users = results;
            console.log('>>>Check users:', users);
            res.send(JSON.stringify(users));
        }
    )
};

export const getTestPage = (req, res) => {
    return res.status(200).json({
        message: 'Test API',
        endpoints: {
            test: '/api/test',
            websocket: 'ws://localhost:5000'
        }
    });
};