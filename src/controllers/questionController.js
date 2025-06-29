import fs from 'fs';
import path from 'path';
import pool from "../config/database.js";
import Question from "../models/question.js";
import { deleteImageOnCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryUtils.js';

// Lấy tất cả câu hỏi của một bộ câu hỏi
export const getQuestions = async (req, res) => {
  try {
    const { question_set_id } = req.query;
    if (!question_set_id) return res.status(400).json({ success: false, message: "Thiếu question_set_id" });

    const questions = await Question.getBySetId(question_set_id);
    if (questions.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy danh sách câu hỏi" });
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
    if (question.length === 0) return res.status(404).json({ success: false, message: "Không tìm thấy câu hỏi" });
    res.json({ success: true, question: question });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
}

// Tạo mới một câu hỏi (chỉ user đã đăng nhập mới được phép)
export const createQuestion = async (req, res) => {
  try {
    const { question_set_id, content, type, points, time_limit, image_url } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    const id = await Question.create({ question_set_id, content, image_url, type, points, time_limit });
    if (!id) return res.status(400).json({ success: false, message: "Thêm câu hỏi thất bại" });
    res.status(201).json({ success: true, question_id: id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Sửa câu hỏi
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, points, time_limit, image_url } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });

    // Lấy ảnh cũ từ DB
    const [rows] = await pool.query("SELECT image_url FROM questions WHERE id = ?", [id]);
    let oldImageUrl = null;
    if (rows.length > 0) {
      oldImageUrl = rows[0].image_url;
    }

    let query, params;
    if (typeof image_url !== 'undefined') {
      query = "UPDATE questions SET content=?, image_url=?, type=?, points=?, time_limit=? WHERE id=?";
      params = [content, image_url, type, points, time_limit, id];
    } else {
      query = "UPDATE questions SET content=?, type=?, points=?, time_limit=? WHERE id=?";
      params = [content, type, points, time_limit, id];
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy câu hỏi"
      });
    }

    // Nếu có ảnh cũ và cập nhật ảnh mới (image_url khác ảnh cũ), xóa ảnh cũ trên Cloudinary nếu là ảnh Cloudinary
    if (oldImageUrl && typeof image_url !== 'undefined' && image_url && image_url !== oldImageUrl) {
      const publicId = getPublicIdFromUrl(oldImageUrl);
      if (publicId) {
        await deleteImageOnCloudinary(publicId);
      }
    }

    res.json({ success: true, message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Xóa câu hỏi
export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    // Lấy image_url từ DB
    const [rows] = await pool.query("SELECT image_url FROM questions WHERE id = ?", [id]);
    let image_url = null;
    if (rows.length > 0) {
      image_url = rows[0].image_url;
    }

    await Question.delete(id);

    // Xóa ảnh trên Cloudinary nếu có
    if (image_url && image_url.includes('cloudinary.com')) {
      const publicId = getPublicIdFromUrl(image_url);
      if (publicId) {
        await deleteImageOnCloudinary(publicId);
      }
    }

    res.json({ success: true, message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

