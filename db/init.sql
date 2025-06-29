-- Tạo cơ sở dữ liệu nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS `game-multiplayer`;

-- Sử dụng cơ sở dữ liệu
USE `game-multiplayer`;

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `role` ENUM('user', 'admin') NULL DEFAULT 'user',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    -- Thêm cột isGoogleAccount để đánh dấu tài khoản từ Google
    `isGoogleAccount` BOOLEAN DEFAULT FALSE
);
ALTER TABLE `users`
    ADD UNIQUE `users_username_unique`(`username`), 
    ADD UNIQUE `users_email_unique`(`email`);

-- Tạo bảng question_sets
CREATE TABLE IF NOT EXISTS `question_sets` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `image_url` VARCHAR(255) NULL,
    `created_by` INT NULL
);

-- Tạo bảng questions
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `question_set_id` INT NULL,
    `content` TEXT NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `type` ENUM('choice', 'text') NULL DEFAULT 'choice',
    `points` INT NULL DEFAULT 10,
    `time_limit` INT NULL DEFAULT 30
);

-- Tạo bảng answers
CREATE TABLE IF NOT EXISTS `answers` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `question_id` INT NULL,
    `content` TEXT NOT NULL,
    `is_correct` BOOLEAN NULL DEFAULT FALSE
);

-- Tạo bảng rooms
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `pin` VARCHAR(6) NOT NULL,
    `question_set_id` INT NOT NULL,
    `host_id` INT NOT NULL,
    `type` ENUM('sync', 'async') NULL DEFAULT 'async',
    `status` ENUM('waiting', 'started', 'ended') NULL DEFAULT 'waiting',
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    `ended_at` DATETIME NULL
);
ALTER TABLE `rooms` ADD UNIQUE `rooms_pin_unique`(`pin`);

-- Tạo bảng players
CREATE TABLE IF NOT EXISTS `players` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NULL,
    `nickname` VARCHAR(100) NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `score` INT NULL,
    `joined_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng player_answers
CREATE TABLE IF NOT EXISTS `player_answers` (
    `player_id` INT NULL,
    `question_id` INT NULL,
    `answer_id` INT NULL,
    `answer_text` TEXT NULL,
    `is_correct` BOOLEAN NULL,
    `response_time` INT NOT NULL,
    `points` INT NULL
);
ALTER TABLE `player_answers` ADD UNIQUE `unique_player_question` (`player_id`, `question_id`);

-- Liên kết FOREIGN KEY
ALTER TABLE `question_sets`
  ADD CONSTRAINT `question_sets_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `questions`
  ADD CONSTRAINT `questions_question_set_id_foreign` FOREIGN KEY (`question_set_id`) REFERENCES `question_sets`(`id`) ON DELETE CASCADE;

ALTER TABLE `answers`
  ADD CONSTRAINT `answers_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE;

ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_host_id_foreign` FOREIGN KEY (`host_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rooms_question_set_id_foreign` FOREIGN KEY (`question_set_id`) REFERENCES `question_sets` (`id`) ON DELETE CASCADE;

ALTER TABLE `players`
  ADD CONSTRAINT `players_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

ALTER TABLE `player_answers`
  ADD CONSTRAINT `player_answers_answer_id_foreign` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `player_answers_player_id_foreign` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `player_answers_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;
