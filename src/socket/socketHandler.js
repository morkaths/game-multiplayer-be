import Room from '../models/room.js';
import Player from '../models/player.js';
import PlayerAnswer from '../models/playerAnswer.js';

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Host join room
        socket.on('host-join-room', async ({ pin }) => {
            try {
                // Kiểm tra room tồn tại
                const room = await Room.getByPin(pin);
                if (!room) {
                    socket.emit('error', { message: 'Phòng không tồn tại' });
                    return;
                }

                // Join socket room
                socket.join(pin);
            } catch (err) {
                console.error('Error in host-join-room:', err);
                socket.emit('error', { message: 'Lỗi khi host join room', details: err.message });
            }
        });

        // Player join room
        socket.on('join-room', async ({ pin, player }) => {
            try {
                // 1. Kiểm tra room tồn tại
                const room = await Room.getByPin(pin);
                if (!room) {
                    socket.emit('error', { message: 'Phòng không tồn tại' });
                    return;
                }

                // 2. Lưu player vào DB (cần lưu)
                const isNicknameExists = await Player.checkNickname(room.id, player.nickname);
                if (isNicknameExists) {
                    socket.emit('error', { message: 'Nickname đã tồn tại trong room' });
                    return;
                }

                const playerId = await Player.create({
                    room_id: room.id,
                    nickname: player.nickname,
                    score: 0
                });

                // 3. Join socket room và thông báo
                socket.join(pin);
                io.to(pin).emit('player-joined', { 
                    player: { 
                        id: playerId, 
                        nickname: player.nickname,
                        score: 0
                    } 
                });
            } catch (err) {
                console.error('Error in join-room:', err);
                socket.emit('error', { message: 'Lỗi khi join room', details: err.message });
            }
        });

        // Host bắt đầu game
        socket.on('start-game', (pin) => {
            io.to(pin).emit('game-started');
        });

        // Host chuyển câu hỏi
        socket.on('next-question', ({ pin, question }) => {
            io.to(pin).emit('next-question', { question });
        });

        // Player gửi đáp án
        socket.on('submit-answer', async (data) => {
            try {
                // 1. Lưu câu trả lời vào DB (cần lưu)
                await PlayerAnswer.create({
                    player_id: data.playerId,
                    question_id: data.questionId,
                    answer_id: data.answerId,
                    is_correct: data.isCorrect,
                    response_time: data.responseTime,
                    points: data.points
                });

                // 2. Thông báo real-time
                io.to(data.pin).emit('player-answered', {
                    playerId: data.playerId,
                    points: data.points
                });
            } catch (err) {
                socket.emit('error', { message: 'Lỗi khi lưu câu trả lời' });
            }
        });

        // Player rời phòng
        socket.on('leave-room', (pin) => {
            socket.leave(pin);
            socket.to(pin).emit('player-left', { socketId: socket.id });
        });

        // Ngắt kết nối
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });

        // Test event (giữ lại cho debug)
        socket.on('test-event', (data) => {
            console.log('Received test event:', data);
            socket.emit('test-response', { 
                message: 'Server received your message', 
                receivedData: data 
            });
        });

        // Game over
        socket.on('game-over', async ({ pin }) => {
            try {
                // 1. Cập nhật trạng thái room trong DB bằng PIN
                await Room.updateByPin(pin, {
                    status: 'ended',
                    ended_at: new Date()
                });

                // 2. Thông báo kết thúc
                io.to(pin).emit('game-over');
            } catch (err) {
                socket.emit('error', { message: 'Lỗi khi kết thúc game' });
            }
        });
    });
};

export default socketHandler;