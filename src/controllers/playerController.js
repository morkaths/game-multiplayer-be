import Player from '../models/player.js';
import Room from '../models/room.js';

// Lấy danh sách player trong 1 room
export const getPlayers = async (req, res) => {
  try {
    const { room_id } = req.query;
    if (!room_id) return res.status(400).json({ success: false, message: 'Thiếu room_id' });
    const players = await Player.getByRoomId(room_id);
    if (players.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy player trong phòng này' });
    res.json({ success: true, players });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

export const getPlayersByPin = async (req, res) => {
  try {
    const { pin } = req.query;
    if (!pin) return res.status(400).json({ success: false, message: 'Thiếu pin' });

    const room = await Room.getByPin(pin);
    if (!room) return res.status(404).json({ success: false, message: 'Không tồn tại phòng với pin này' });

    const players = await Player.getByRoomId(room.id);
    if (!players) return res.status(404).json({ success: false, message: 'Không tồn tại player trong phòng này' });
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
    const { pin, nickname, avatar_url } = req.body;
    if (!pin || !nickname) {
      return res.status(400).json({ success: false, message: 'Thiếu pin hoặc nickname' });
    }

    // Kiểm tra pin
    const room = await Room.getByPin(pin);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Không tồn tại phòng với pin này' });
    }

    // Kiểm tra xem player đã tồn tại trong room chưa
    const isNicknameExists = await Player.checkNickname(room.id, nickname);
    if (isNicknameExists) {
      return res.status(400).json({ success: false, message: 'Nickname đã tồn tại trong room' });
    }

    // Thêm player vào room
    const id = await Player.create({ room_id: room.id, nickname, avatar_url });
    if (!id) return res.status(400).json({ success: false, message: 'Thêm player thất bại' });
    res.status(201).json({ success: true, player_id: id });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};

// Cập nhật thông tin player
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const { nickname, avatar_url, score } = req.body;

    // Kiểm tra xem player có tồn tại không
    const player = await Player.getById(id);
    if (!player) return res.status(404).json({ success: false, message: 'Không tìm thấy player' });

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
    // Kiểm tra xem player có tồn tại không
    const player = await Player.getById(id);
    if (!player) return res.status(404).json({ success: false, message: 'Không tìm thấy player' });

    await Player.delete(id);
    res.json({ success: true, message: 'Xoá thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
  }
};
