-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng users
-- -----------------------------------------------------
INSERT INTO `users` (`username`, `password`, `email`, `role`) VALUES
('admin', '123456', 'admin@example.com', 'admin'),
('user1', '123456', 'user1@example.com', 'user'),
('user2', '123456', 'user2@example.com', 'user'),
('user3', '123456', 'user3@example.com', 'user'),
('morkath', '123456', 'morkath@example.com', 'user');


-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng question_sets
-- -----------------------------------------------------
INSERT INTO `question_sets` (`title`, `description`, `image_url`, `created_by`) VALUES
('Kiến thức chung', 'Bộ câu hỏi về kiến thức chung', '/uploads/question_set/general-knowledge.png', 5),
('Toán học cơ bản', 'Các câu hỏi về toán học cấp tiểu học', '/uploads/question_set/basic-math.png', 5),
('Lập trình JavaScript', 'Kiến thức cơ bản về JavaScript', '/uploads/question_set/javascript.png', 5),
('Địa lý thế giới', 'Các câu hỏi về địa lý thế giới', '/uploads/question_set/world-geography.png', 5),
('Lịch sử Việt Nam', 'Các câu hỏi về lịch sử Việt Nam', '/uploads/question_set/vietnam-history.png', 5);

-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng questions
-- -----------------------------------------------------
INSERT INTO `questions` (`question_set_id`, `content`, `image_url`, `type`, `points`, `time_limit`, `difficulty`) VALUES
-- Kiến thức chung
(1, 'Thủ đô của Việt Nam là gì?', '/uploads/question/question1.png', 'choice', 10, 20, 'easy'),
(1, 'Quốc gia nào có diện tích lớn nhất thế giới?', '/uploads/question/question2.png', 'choice', 20, 30, 'medium'),
(1, 'Loài vật nào có thể nhìn bằng tai?', '/uploads/question/question3.png', 'choice', 10, 30, 'hard'),
-- Toán học cơ bản
(2, '5 + 7 = ?', NULL, 'choice', 10, 15, 'easy'),
(2, 'Bài toán: Lan có 10 quả táo, Lan cho Hoa 3 quả. Hỏi Lan còn lại bao nhiêu quả táo?', '/uploads/questions/apples.jpg', 'choice', 10, 20, 'easy'),
(2, 'Chu vi của hình vuông cạnh 5cm là bao nhiêu?', '/uploads/questions/square.jpg', 'choice', 10, 30, 'medium'),
-- Lập trình JavaScript
(3, 'Lệnh nào để hiển thị thông báo trong JavaScript?', '/uploads/questions/javascript-alert.jpg', 'choice', 10, 20, 'easy'),
(3, 'Cú pháp khai báo biến trong ES6 là gì?', '/uploads/questions/javascript-variables.jpg', 'choice', 10, 30, 'medium'),
(3, 'Hãy viết một hàm JavaScript để kiểm tra số nguyên tố', '/uploads/questions/prime-numbers.jpg', 'text', 10, 45, 'hard'),
-- Địa lý thế giới
(4, 'Quốc gia nào có dân số đông nhất thế giới?', '/uploads/questions/population.jpg', 'choice', 10, 20, 'easy'),
(4, 'Cửu Long Giang chảy qua bao nhiêu quốc gia?', '/uploads/questions/mekong-river.jpg', 'choice', 10, 30, 'medium'),
-- Lịch sử Việt Nam
(5, 'Ai là người sáng lập ra nhà nước Âu Lạc?', '/uploads/questions/an-duong-vuong.jpg', 'choice', 10, 20, 'medium'),
(5, 'Cuộc khởi nghĩa nào chống lại nhà Minh diễn ra vào thế kỷ 15?', '/uploads/questions/lam-son-uprising.jpg', 'choice', 20, 60, 'hard');

-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng answers
-- -----------------------------------------------------
INSERT INTO `answers` (`question_id`, `content`, `is_correct`) VALUES
-- Câu 1: Thủ đô VN
(1, 'Hà Nội', 1),
(1, 'TP Hồ Chí Minh', 0),
(1, 'Đà Nẵng', 0),
(1, 'Hải Phòng', 0),
-- Câu 2: Quốc gia lớn nhất
(2, 'Trung Quốc', 0),
(2, 'Nga', 1),
(2, 'Mỹ', 0),
(2, 'Canada', 0),
-- Câu 3: Loài vật nhìn bằng tai
(3, 'Dơi', 1),
(3, 'Mèo', 0),
(3, 'Cú mèo', 0),
(3, 'Cá heo', 1),
-- Câu 4: Phép cộng
(4, '11', 0),
(4, '12', 1),
(4, '13', 0),
(4, '10', 0),
-- Câu 5: Bài toán táo
(5, '6 quả', 0),
(5, '7 quả', 1),
(5, '8 quả', 0),
(5, '5 quả', 0),
-- Câu 6: Chu vi hình vuông
(6, '20 cm', 1),
(6, '30 cm', 0),
(6, '15 cm', 0),
(6, '10 cm', 0),
-- Câu 7: Lệnh hiển thị JS
(7, 'console.log()', 0),
(7, 'alert()', 1),
(7, 'document.write()', 0),
(7, 'print()', 0),
-- Câu 8: Khai báo biến ES6
(8, 'var', 0),
(8, 'let', 1),
(8, 'const', 0),
(8, 'Cả B và C', 0),
-- Câu 9: Hàm số nguyên tố (text answer)
(9, 'function isPrime(num) { if (num <= 1) return false; for (let i = 2; i <= Math.sqrt(num); i++) { if (num % i === 0) return false; } return true; }', 1),
-- Câu 10: Quốc gia dân số đông nhất
(10, 'Ấn Độ', 0),
(10, 'Trung Quốc', 1),
(10, 'Mỹ', 0),
(10, 'Indonesia', 0),
-- Câu 11: Cửu Long Giang
(11, '5 quốc gia', 0),
(11, '6 quốc gia', 1),
(11, '4 quốc gia', 0),
(11, '7 quốc gia', 0),
-- Câu 12: Nhà nước Âu Lạc
(12, 'An Dương Vương', 1),
(12, 'Hùng Vương', 0),
(12, 'Lý Nam Đế', 0),
(12, 'Trưng Trắc', 0),
-- Câu 13: Cuộc khởi nghĩa chống Minh
(13, 'Khởi nghĩa Lam Sơn', 1),
(13, 'Khởi nghĩa Hai Bà Trưng', 0),
(13, 'Khởi nghĩa Lý Bí', 0),
(13, 'Khởi nghĩa Bãi Sậy', 0);

-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng rooms
-- -----------------------------------------------------
INSERT INTO rooms (pin, question_set_id, host_id, type, status, created_at, ended_at) VALUES
('ABC123', 1, 6, 'async', 'waiting', NOW(), NULL),
('XYZ789', 2, 2, 'async', 'started', NOW(), NULL),
('QWE456', 1, 1, 'sync', 'ended', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('RTY321', 3, 3, 'sync', 'waiting', NOW(), NULL),
('UIO654', 2, 1, 'async', 'waiting', NOW(), NULL),
('ASD987', 4, 4, 'sync', 'started', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL),
('FGH234', 1, 2, 'sync', 'ended', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('JKL567', 3, 3, 'async', 'waiting', NOW(), NULL),
('ZXC890', 2, 4, 'sync', 'waiting', NOW(), NULL),
('VBN345', 1, 1, 'sync', 'started', DATE_SUB(NOW(), INTERVAL 15 MINUTE), NULL);

-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng players
-- -----------------------------------------------------
INSERT INTO `players` (`room_id`, `nickname`, `avatar_url`, `score`, `joined_at`) VALUES
-- Room 1
(1, 'Claude', NULL, 0, NOW()),
(1, 'ChatGPT', NULL, 0, NOW()),
(1, 'Copilot', NULL, 0, NOW()),
-- Room 2
(2, 'MathWhiz', NULL, 150, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, 'NumberCruncher', NULL, 120, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
-- Room 3
(3, 'CodeNinja', NULL, 200, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'JavaScriptMaster', NULL, 180, DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Room 4
(4, 'GeoExpert', NULL, 80, NOW()),
(4, 'Traveler', NULL, 65, NOW());

-- -----------------------------------------------------
-- Dữ liệu mẫu cho bảng player_answers
-- -----------------------------------------------------
INSERT INTO `player_answers` (`player_id`, `question_id`, `answer_id`, `answer_text`, `is_correct`, `response_time`, `points`) VALUES
(4, 4, 14, NULL, 1, 8, 100),
(5, 4, 13, NULL, 0, 5, 0),
(6, 7, 26, NULL, 1, 7, 100),
(6, 8, 30, NULL, 1, 15, 100);
