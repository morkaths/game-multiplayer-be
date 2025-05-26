import Room from '../models/room.js';

// Lấy danh sách tất cả phòng (lọc theo host_id)
export const getRooms = async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM rooms WHERE host_id = ?', [req.query.host_id]);
    res.json({ success: true, rooms: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy chi tiết 1 phòng theo id
export const getRoom = async (req, res) => {
  try {
    const room = await Room.getById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
// Tạo mã pin ngẫu nhiên
function generatePin(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}
// Tạo phòng mới
export const createRoom = async (req, res) => {
  try {
    const { question_set_id, type, status } = req.body;
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
    res.status(201).json({ success: true, room_id: id, pin });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật phòng
export const updateRoom = async (req, res) => {
  try {
    const { status, ended_at } = req.body;
    const { id } = req.params;

    await Room.update(id, { status, ended_at });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Xoá phòng
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    await Room.delete(id);
    res.json({ success: true, message: 'Xoá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
