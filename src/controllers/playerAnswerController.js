import PlayerAnswer from '../models/playerAnswer.js';
import Answer from '../models/answer.js';
import Question from '../models/question.js';
import Player from '../models/player.js';

// Player gửi đáp án (submit answer)
export const submitAnswer = async (req, res) => {
  try {
    const { player_id, question_id, answer_id, answer_text, response_time } = req.body;

    // Lấy điểm cơ bản của câu hỏi
    const question = await Question.getById(question_id);
    const basePoints = question?.points;

    // Lấy đáp án đúng
    const correctAnswer = await Answer.getCorrectAnswer(question_id);

    let is_correct = false;
    if (answer_id) {
      is_correct = correctAnswer && correctAnswer.id === answer_id;
    } else if (answer_text) {
      is_correct = correctAnswer && correctAnswer.content.trim().toLowerCase() === answer_text.trim().toLowerCase();
    }
    // Tính điểm sử dụng hàm tiện ích
    const points = PlayerAnswer.calculatePoints(basePoints, response_time, is_correct);

    // Lưu vào bảng player_answers
    await PlayerAnswer.create({
      player_id,
      question_id,
      answer_id,
      answer_text,
      is_correct,
      response_time,
      points
    });

    // Lấy thông tin player
    const player = await Player.getById(player_id);
    if (player) {
      const newScore = (player.score || 0) + points;
      await Player.update(player_id, { score: newScore });
    }
    console.log(player);

    res.json({ success: true, points: Math.round(points) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả câu trả lời của 1 player
export const getAnswersByPlayer = async (req, res) => {
  try {
    const { player_id } = req.query;
    if (!player_id) return res.status(400).json({ success: false, message: 'Thiếu player_id' });
    const answers = await PlayerAnswer.getByPlayerId(player_id);
    if (answers.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });
    res.json({ success: true, answers: answers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả câu trả lời trong 1 phòng
export const getAnswersByRoom = async (req, res) => {
  try {
    const { room_id } = req.query;
    if (!room_id) return res.status(400).json({ success: false, message: 'Thiếu room_id' });
    const answers = await PlayerAnswer.getByRoomId(room_id);
    if (answers.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });
    res.json({ success: true, answers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả câu trả lời cho 1 câu hỏi trong phòng
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { room_id, question_id } = req.query;
    if (!room_id || !question_id)
      return res.status(400).json({ success: false, message: 'Thiếu room_id hoặc question_id' });
    const answers = await PlayerAnswer.getByQuestionId(room_id, question_id);
    if (answers.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy câu trả lời' });
    res.json({ success: true, answers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
