import Room from '../models/room.js';
import QuestionSet from '../models/questionSet.js';

// Báo cáo tổng quan của tôi
export const getReports = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập!' });
        const { type } = req.query;
        if (!type || (type !== 'sync' && type !== 'async')) {
            return res.status(400).json({ success: false, message: 'Type phải là sync hoặc async' });
        }
        const reports = await Room.reports(req.user.id, type);
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};

// Báo cáo chi tiết của phòng 
export const getRoomReport = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Data", req.params);
        const report = await Room.report(id);
        if (!report) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phòng' });
        }
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};

// Danh sách báo cáo người chơi
export const getPlayerReports = async (req, res) => {
    try {
        const { id } = req.params;
        const reports = await Room.playerReports(id);
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: err.message });
    }
};