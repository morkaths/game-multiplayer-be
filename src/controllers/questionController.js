import fs from 'fs';
import path from 'path';
import pool from "../config/database.js";
import Question from "../models/question.js";

// Lấy tất cả câu hỏi của một bộ câu hỏi
export const getQuestions = async (req, res) => {
  try {
    const { question_set_id } = req.query;
    if (!question_set_id) return res.status(400).json({ success: false, message: "Thiếu question_set_id" });
    const questions = await Question.getBySetId(question_set_id);
    if (questions.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh sách câu hỏi" });
    }
    res.json({ success: true, questions: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Lấy chi tiết một câu hỏi
export const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });
    const question = await Question.getById(id);
    if (question.length === 0)
      return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    res.json({ success: true, question: question });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
}

// Tạo mới một câu hỏi (chỉ user đã đăng nhập mới được phép)
export const createQuestion = async (req, res) => {
  try {
    const { question_set_id, content, type, points, time_limit } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    const image_url = req.file
      ? `/uploads/question/${req.file.filename}`
      : null;

    const [result] = await pool.query(
      "INSERT INTO questions (question_set_id, content, image_url, type, points, time_limit) VALUES (?, ?, ?, ?, ?, ?)",
      [question_set_id, content, image_url, type, points, time_limit]
    );

    res.status(201).json({ success: true, question_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Sửa câu hỏi
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, points, time_limit } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });

    let oldImageUrl = null;
    if (req.file) {
      const [oldQuestion] = await pool.query("SELECT image_url FROM questions WHERE id = ?", [id]);
      if (oldQuestion.length > 0) {
        oldImageUrl = oldQuestion[0].image_url;
      }
    }
    const query = req.file
      ? "UPDATE questions SET content=?, image_url=?, type=?, points=?, time_limit=? WHERE id=?"
      : "UPDATE questions SET content=?, type=?, points=?, time_limit=? WHERE id=?";
    
    const params = req.file
      ? [content, `/uploads/question/${req.file.filename}`, type, points, time_limit, id]
      : [content, type, points, time_limit, id];

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy câu hỏi"
      });
    }

    // Xóa ảnh cũ nếu có
    if (oldImageUrl && req.file) {
      const oldImagePath = path.join(process.cwd(), oldImageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Xóa câu hỏi
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    await pool.query("DELETE FROM questions WHERE id=?", [id]);
    res.json({ success: true, message: "Xóa thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};
