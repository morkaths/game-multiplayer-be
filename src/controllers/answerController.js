import Answer from '../models/answer.js';

// Lấy tất cả đáp án của 1 câu hỏi
export const getAnswers = async (req, res) => {
  try {
    const { question_id } = req.query;
    if (!question_id) return res.status(400).json({ success: false, message: 'Thiếu question_id' });
    
    const answers = await Answer.getByQuestionId(question_id);
    if (!answers || answers.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đáp án' });
    }
    res.json({ success: true, answers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy chi tiết một đáp án
export const getAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Thiếu id' });
    
    const answer = await Answer.getById(id);
    if (!answers || answers.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đáp án' });
    }
    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Thêm đáp án mới cho câu hỏi
export const createAnswer = async (req, res) => {
  try {
    const { question_id, content, is_correct } = req.body;
    if (!question_id || !content) {
      return res.status(400).json({ success: false, message: 'Thiếu question_id hoặc content' });
    }

    const id = await Answer.create({ question_id, content, is_correct: !!is_correct });
    res.status(201).json({ success: true, answer_id: id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Sửa đáp án
export const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, is_correct } = req.body;

    // Lấy đáp án hiện tại
    const answer = await Answer.getById(id);
    if (!answer) return res.status(404).json({ success: false, message: 'Không tìm thấy đáp án' });

    // Nếu chuyển sang đúng, kiểm tra đã có đáp án đúng chưa
    if (is_correct && !answer.is_correct) {
      const existingCorrect = await Answer.getCorrectAnswer(answer.question_id);
      if (existingCorrect && existingCorrect.id !== answer.id) {
        return res.status(400).json({ success: false, message: 'Câu hỏi này đã có đáp án đúng!' });
      }
    }

    await Answer.update(id, { content, is_correct: !!is_correct });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Xoá đáp án
export const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    await Answer.delete(id);
    res.json({ success: true, message: 'Xoá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
