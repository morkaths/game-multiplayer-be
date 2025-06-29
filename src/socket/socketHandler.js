import Room from '../models/room.js';
import Player from '../models/player.js';
import Question from '../models/question.js';
import Answer from '../models/answer.js';
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

        // Player rời phòng
        socket.on('leave-room', ({ pin }) => {
            socket.leave(pin);
            socket.to(pin).emit('player-left', { socketId: socket.id });
        });

        // Host bắt đầu game
        socket.on('start-game', async ({ pin }) => {
            try {
                const room = await Room.getByPin(pin);
                if (!room) {
                    socket.emit('error', { message: 'Phòng không tồn tại' });
                    return;
                }

                // 1. Cập nhật trạng thái phòng trong DB
                await Room.updateByPin(pin, {
                    status: 'started'
                });

                // 2. Phát sự kiện bắt đầu game và gửi câu hỏi đầu tiên
                io.to(pin).emit('game-started');
            } catch (err) {
                console.error('Error starting game:', err);
                socket.emit('error', { message: 'Lỗi khi bắt đầu game' });
            }
        });

        socket.on('get-game-data', async ({ pin }) => {
            try {
                const room = await Room.getByPin(pin);
                if (!room) {
                    socket.emit('error', { message: 'Phòng không tồn tại' });
                    return;
                }
        
                // Lấy danh sách id câu hỏi của question set
                const questionIds = await Question.getIdsBySetId(room.question_set_id);
                const question = await Question.getFirstBySetId(room.question_set_id);
                const answers = await Answer.getByQuestionId(question.id);
        
                // Trả về dữ liệu game cho client
                socket.emit('game-data', { questionIds, question, answers });
            } catch (err) {
                console.error('Error getting game data:', err);
                socket.emit('error', { message: 'Lỗi khi lấy dữ liệu game' });
            }
        });
        
        // Host chuyển câu hỏi
        socket.on('next-question', async ({ pin, question_id, index }) => {
            try {

                console.log('next-question received:', { pin, question_id, index });
                // 1. Lấy câu hỏi và các câu trả lời từ DB
                const question = await Question.getById(question_id);
                if (!question) {
                    socket.emit('error', { message: 'Câu hỏi không tồn tại' });
                    return;
                }

                const answers = await Answer.getByQuestionId(question_id);
                if (!answers) {
                    socket.emit('error', { message: 'Câu hỏi không có câu trả lời' });
                    return;
                }

                // 2. Thông báo real-time
                io.to(pin).emit('next-question', { question, answers, index });
            } catch (err) {
                console.error('Error in next-question:', err);
                socket.emit('error', { message: 'Lỗi khi chuyển câu hỏi', details: err.message });
            }
        });

        // Player gửi đáp án
        socket.on('submit-answer', async ({ data }) => {
            try {
                const { pin, player_id, question_id, answer_id, answer_text, response_time } = data;

                // Lấy điểm cơ bản của câu hỏi
                const question = await Question.getById(question_id);
                const basePoints = question?.points;

                // Lấy đáp án đúng
                const correctAnswers = await Answer.getCorrectAnswer(question_id);

                let is_correct = false;
                if (answer_id) {
                    is_correct = correctAnswers.some(ans => ans.id === answer_id);
                } else if (answer_text) {
                    is_correct = correctAnswers.some(ans =>
                        ans.content.trim().toLowerCase() === answer_text.trim().toLowerCase()
                    );
                }

                // Tính điểm sử dụng hàm tiện ích
                const points = PlayerAnswer.calculatePoints(basePoints, response_time, is_correct);

                // Lưu câu trả lời vào DB (cần lưu)
                await PlayerAnswer.create({
                    player_id,
                    question_id,
                    answer_id,
                    answer_text,
                    is_correct,
                    response_time,
                    points
                });

                // Lấy thông tin player hiện tại
                const player = await Player.getById(player_id);
                if (player) {
                    // Cập nhật điểm số
                    const newScore = (player.score || 0) + points;
                    await Player.update(player_id, { score: newScore });

                    // Lấy danh sách trả lời câu hỏi của phòng
                    const playerAnswers = await PlayerAnswer.getByQuestionId(player.room_id, question_id);

                    // 2. Thông báo real-time
                    io.to(pin).emit('player-answered', {
                        playerAnswers
                    });
                }
            } catch (err) {
                console.error('Error in submit-answer:', err);
                socket.emit('error', { message: 'Lỗi khi lưu câu trả lời', details: err.message });
            }
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
                io.to(pin).emit('game-finished');
            } catch (err) {
                socket.emit('error', { message: 'Lỗi khi kết thúc game' });
            }
        });
    });
};

export default socketHandler;