import Room from '../models/room.js';
import QuestionSet from '../models/questionSet.js';

// Lấy danh sách tất cả phòng
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.getAll();
    if (rooms.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách phòng' });
    res.json({ success: true, rooms: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy danh sách phòng theo host_id
export const getRoomsByHostId = async (req, res) => {
  try {
    const { host_id } = req.query;
    if (!host_id) return res.status(400).json({ success: false, message: 'Thiếu host_id' });
    
    const rooms = await Room.getByHostId(host_id);
    if (rooms.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách phòng' });
    res.json({ success: true, rooms: rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy chi tiết 1 phòng theo id
export const getRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra xem phòng có tồn tại không
    const room = await Room.getById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy phòng theo pin
export const getRoomByPin = async (req, res) => {
  try {
    const { pin } = req.query;
    if (!pin) return res.status(400).json({ success: false, message: 'Thiếu pin' });
    const room = await Room.getByPin(pin);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    res.json({ success: true, room: room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
}

// Tạo mã pin ngẫu nhiên
function generatePin(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

// Tạo phòng mới (cần đăng nhập)
export const createRoom = async (req, res) => {
  try {
    const { question_set_id, type, status } = req.body;
    
    // Kiểm tra quyền đăng nhập
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }

    // Kiểm tra xem bộ câu hỏi có tồn tại không
    const questionSet = await QuestionSet.getById(question_set_id);
    if (!questionSet) return res.status(404).json({ success: false, message: 'Không tìm thấy bộ câu hỏi' });

    const host_id = req.user.id;

    // Sinh pin và đảm bảo không trùng
    let pin;
    let exists = true;
    do {
      pin = generatePin(6);
      const room = await Room.getByPin(pin);
      exists = !!room;
    } while (exists);

    const id = await Room.create({ pin, question_set_id, host_id, type, status });
    if (!id) return res.status(400).json({ success: false, message: 'Thêm phòng thất bại' });
    res.status(201).json({ success: true, room_id: id, pin: pin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật phòng (cần đăng nhập)
export const updateRoom = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Kiểm tra quyền đăng nhập
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }

    // Kiểm tra xem phòng có tồn tại không
    const room = await Room.getById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

    // Kiểm tra xem phòng có thuộc về user đang đăng nhập không
    if (room.host_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật phòng này' });
    }
    const ended_at = (status === 'ended') ? new Date() : null;
    await Room.update(id, { status, ended_at });
    res.json({ success: true, message: 'Cập nhật phòng thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Xoá phòng (cần đăng nhập)
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền đăng nhập
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
    }

    // Kiểm tra xem phòng có tồn tại không
    const room = await Room.getById(id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });

    // Kiểm tra xem phòng có thuộc về user đang đăng nhập không
    if (room.host_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xoá phòng này' });
    }

    await Room.delete(id);
    res.json({ success: true, message: 'Xoá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
