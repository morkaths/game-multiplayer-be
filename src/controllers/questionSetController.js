import fs from 'fs';
import path from 'path';
import pool from "../config/database.js";
import QuestionSet from "../models/questionSet.js";

// Lấy tất cả bộ câu hỏi
export const getQuestionSets = async (req, res) => {
  try {
    const questionSets = await QuestionSet.getAll();
    if (!questionSets || questionSets.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bộ câu hỏi" });
    }
    res.json({ success: true, question_sets: questionSets });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Lấy bộ câu hỏi của tôi
export const getMyQuestionSets = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    const questionSets = await QuestionSet.getByUserId(req.user.id);
    if (!questionSets || questionSets.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bộ câu hỏi" });
    }
    res.json({ success: true, question_sets: questionSets });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Lấy bộ câu hỏi theo user id
export const getQuestionSetsByUser = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: "Thiếu userId" });

    const questionSets = await QuestionSet.getByUserId(user_id);
    if (!questionSets || questionSets.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bộ câu hỏi" });
    }
    res.json({ success: true, question_sets: questionSets });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Lấy bộ câu hỏi theo id
export const getQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });
    const questionSet = await QuestionSet.getById(id);
    if (!questionSet) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bộ câu hỏi" });
    }
    res.json({ success: true, question_set: questionSet });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Tạo mới bộ câu hỏi (chỉ user đã đăng nhập)
export const createQuestionSet = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    const image_url = req.file
      ? `/uploads/question_set/${req.file.filename}`
      : null;

    const [result] = await pool.query(
      "INSERT INTO question_sets (title, description, image_url, created_by) VALUES (?, ?, ?, ?)",
      [title, description, image_url, req.user.id]
    );

    res.status(201).json({ success: true, question_set_id: result.insertId });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Sửa bộ câu hỏi
export const updateQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });

    let oldImageUrl = null;
    if (req.file) {
      const [oldQuestionSet] = await pool.query("SELECT image_url FROM question_sets WHERE id = ?", [id]);
      if (oldQuestionSet.length > 0) {
        oldImageUrl = oldQuestionSet[0].image_url;
      }
    }

    const query = req.file
      ? "UPDATE question_sets SET title=?, description=?, image_url=? WHERE id=? AND created_by=?"
      : "UPDATE question_sets SET title=?, description=? WHERE id=? AND created_by=?";

    const params = req.file
      ? [title, description, `/uploads/question_set/${req.file.filename}`, id, req.user.id]
      : [title, description, id, req.user.id];

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bộ câu hỏi hoặc bạn không có quyền sửa"
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

// Xóa bộ câu hỏi
export const deleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "Bạn cần đăng nhập!" });

    // Xóa bộ câu hỏi chỉ khi user là người tạo
    await pool.query("DELETE FROM question_sets WHERE id=? AND created_by=?", [
      id,
      req.user.id,
    ]);
    res.json({ success: true, message: "Xóa thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};
