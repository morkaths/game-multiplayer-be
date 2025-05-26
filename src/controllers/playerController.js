import Player from '../models/player.js';
import Room from '../models/room.js';

// Lấy danh sách player trong 1 room
export const getPlayers = async (req, res) => {
  try {
    const { room_id } = req.query;
    if (!room_id) return res.status(400).json({ success: false, message: 'Thiếu room_id' });
    const players = await Player.getByRoomId(room_id);
    res.json({ success: true, players });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Lấy chi tiết 1 player
export const getPlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const player = await Player.getById(id);
    if (!player) return res.status(404).json({ success: false, message: 'Không tìm thấy player' });
    res.json({ success: true, player });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Thêm player mới vào room
export const createPlayer = async (req, res) => {
  try {
    const { pin, nickname } = req.body;
    if (!pin || !nickname) {
      return res.status(400).json({ success: false, message: 'Thiếu pin hoặc nickname' });
    }

    // Kiểm tra pin
    const room = await Room.getByPin(pin);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tồn tại phòng với pin này' });
    }

    // Lấy đường dẫn avatar nếu có file upload
    const avatar_url = req.file ? `/uploads/avatar/${req.file.filename}` : null;

    // Thêm player vào room
    const id = await Player.create({ room_id: room.id, nickname, avatar_url });
    res.status(201).json({ success: true, player_id: id, room_id: room.id, avatar_url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật thông tin player
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, avatar_url, score } = req.body;
    await Player.update(id, { nickname, avatar_url, score });
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Xoá player khỏi room
export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    await Player.delete(id);
    res.json({ success: true, message: 'Xoá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
