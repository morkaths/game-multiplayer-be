import PlayerAnswer from '../models/playerAnswer.js';
import Answer from '../models/answer.js';

// Player gửi đáp án (submit answer)
export const submitAnswer = async (req, res) => {
  try {
    const { player_id, question_id, answer_id, answer_text, response_time } = req.body;

    // Lấy đáp án đúng
    const correctAnswer = await Answer.getCorrectAnswer(question_id);

    let is_correct = false;
    if (answer_id) {
      is_correct = correctAnswer && correctAnswer.id === answer_id;
    } else if (answer_text) {
      is_correct = correctAnswer && correctAnswer.content.trim().toLowerCase() === answer_text.trim().toLowerCase();
    }

    // Tính điểm (ví dụ: đúng thì 1000 - response_time*10, sai thì 0)
    let points = is_correct ? Math.max(1000 - response_time * 10, 0) : 0;

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

    res.json({ success: true, is_correct, points });
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
    res.json({ success: true, answers });
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
    res.json({ success: true, answers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy tất cả câu trả lời cho 1 câu hỏi
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { question_id } = req.query;
    if (!question_id) return res.status(400).json({ success: false, message: 'Thiếu question_id' });
    const answers = await PlayerAnswer.getByQuestionId(question_id);
    res.json({ success: true, answers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
