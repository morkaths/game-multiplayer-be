import pool from '../config/database.js';

const PlayerAnswer = {
  // Ghi nhận đáp án
  async create(data) {
    await pool.query(
      'INSERT INTO player_answers (player_id, question_id, answer_id, answer_text, is_correct, response_time, points) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.player_id,
        data.question_id,
        data.answer_id || null,
        data.answer_text || null,
        data.is_correct,
        data.response_time,
        data.points
      ]
    );
  },
  // Lấy tất cả câu trả lời của 1 player
  async getByPlayerId(player_id) {
    const [rows] = await pool.query('SELECT * FROM player_answers WHERE player_id = ?', [player_id]);
    return rows;
  },
  // Lấy tất cả câu trả lời trong 1 phòng
  async getByRoomId(room_id) {
    const [rows] = await pool.query(
      `SELECT pa.* FROM player_answers pa
       JOIN players p ON pa.player_id = p.id
       WHERE p.room_id = ?`,
      [room_id]
    );
    return rows;
  },
  // Lấy tất cả câu trả lời cho 1 câu hỏi
  async getByQuestionId(question_id) {
    const [rows] = await pool.query('SELECT * FROM player_answers WHERE question_id = ?', [question_id]);
    return rows;
  }
};

export default PlayerAnswer;
