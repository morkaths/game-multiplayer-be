import fs from 'fs';
import path from 'path';
import pool from "../config/database.js";
import QuestionSet from "../models/questionSet.js";
import { deleteImageOnCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryUtils.js';

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

export const searchQuestionSets = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ success: false, message: "Thiếu từ khóa tìm kiếm" });

    const results = await QuestionSet.search(query);
    res.json({ success: true, question_sets: results });
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

    const id = await QuestionSet.create({ title, description, image_url, created_by: req.user.id });
    if (!id) return res.status(400).json({ success: false, message: "Thêm bộ câu hỏi thất bại" });
    res.status(201).json({ success: true, question_set_id: id });
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
    const { title, description, image_url } = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });

    // Lấy ảnh cũ từ DB
    const [rows] = await pool.query("SELECT image_url FROM question_sets WHERE id = ?", [id]);
    let oldImageUrl = null;
    if (rows.length > 0) {
      oldImageUrl = rows[0].image_url;
    }

    let query, params;
    if (typeof image_url !== 'undefined') {
      query = "UPDATE question_sets SET title=?, description=?, image_url=? WHERE id=? AND created_by=?";
      params = [title, description, image_url, id, req.user.id];
    } else {
      query = "UPDATE question_sets SET title=?, description=? WHERE id=? AND created_by=?";
      params = [title, description, id, req.user.id];
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bộ câu hỏi hoặc bạn không có quyền sửa"
      });
    }

    // Nếu có ảnh cũ và cập nhật ảnh mới (image_url khác ảnh cũ), xóa ảnh cũ trên Cloudinary
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

// Xóa bộ câu hỏi
export const deleteQuestionSet = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user)
      return res.status(401).json({ success: false, message: "Bạn cần đăng nhập!" });

    // Lấy image_url từ DB
    const [rows] = await pool.query("SELECT image_url FROM question_sets WHERE id = ?", [id]);
    let image_url = null;
    if (rows.length > 0) {
      image_url = rows[0].image_url;
    }

    // Xóa bộ câu hỏi chỉ khi user là người tạo
    await QuestionSet.delete(id, req.user.id);

    // Xóa ảnh trên Cloudinary nếu có
    if (image_url) {
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

// Lấy thống kê cho 1 bộ câu hỏi
export const getQuestionSetStats = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Thiếu id" });

    const stats = await QuestionSet.stats(id);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};


