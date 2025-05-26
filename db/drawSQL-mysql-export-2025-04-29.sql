CREATE TABLE `users`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `role` ENUM('user', 'admin') NULL DEFAULT 'user',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP()
);
ALTER TABLE
    `users` ADD UNIQUE `users_username_unique`(`username`);
ALTER TABLE
    `users` ADD UNIQUE `users_email_unique`(`email`);

CREATE TABLE `question_sets`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_by` INT NULL
);

CREATE TABLE `questions`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `question_set_id` INT NULL,
    `content` TEXT NOT NULL,
    `image_url` VARCHAR(255) NULL,
    `type` ENUM('choice', 'text') NULL DEFAULT 'choice',
    `time_limit` INT NULL DEFAULT 30,
    `difficulty` ENUM('easy', 'medium', 'hard') NULL DEFAULT 'easy'
);

CREATE TABLE `answers`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `question_id` INT NULL,
    `content` TEXT NOT NULL,
    `is_correct` BOOLEAN NULL DEFAULT FALSE
);

CREATE TABLE `rooms`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `pin` VARCHAR(6) NOT NULL,
    `question_set_id` INT NOT NULL,
    `host_id` INT NOT NULL,
    `type` ENUM('sync', 'async') NULL DEFAULT 'async',
    `status` ENUM('waiting', 'started', 'ended') NULL DEFAULT 'waiting',
    `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP(),
    `ended_at` DATETIME NULL
);
ALTER TABLE
    `rooms` ADD UNIQUE `rooms_pin_unique`(`pin`);

CREATE TABLE `players`(
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `room_id` INT NULL,
    `nickname` VARCHAR(100) NOT NULL,
    `avatar_url` VARCHAR(255) NULL,
    `score` INT NULL,
    `joined_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP()
);

CREATE TABLE `player_answers`(
    `player_id` INT NULL,
    `question_id` INT NULL,
    `answer_id` INT NULL,
    `answer_text` TEXT NULL,
    `is_correct` BOOLEAN NULL,
    `response_time` INT NOT NULL,
    `points` INT NULL,
    PRIMARY KEY (`player_id`, `question_id`) -- khóa chính tổng hợp
);

-- Liên kết FOREIGN KEY
ALTER TABLE
    `player_answers` ADD CONSTRAINT `player_answers_answer_id_foreign` FOREIGN KEY(`answer_id`) REFERENCES `answers`(`id`);
ALTER TABLE
    `player_answers` ADD CONSTRAINT `player_answers_player_id_foreign` FOREIGN KEY(`player_id`) REFERENCES `players`(`id`);
ALTER TABLE
    `question_sets` ADD CONSTRAINT `question_sets_created_by_foreign` FOREIGN KEY(`created_by`) REFERENCES `users`(`id`);
ALTER TABLE
    `player_answers` ADD CONSTRAINT `player_answers_question_id_foreign` FOREIGN KEY(`question_id`) REFERENCES `questions`(`id`);
ALTER TABLE
    `rooms` ADD CONSTRAINT `rooms_host_id_foreign` FOREIGN KEY(`host_id`) REFERENCES `users`(`id`);
ALTER TABLE
    `answers` ADD CONSTRAINT `answers_question_id_foreign` FOREIGN KEY(`question_id`) REFERENCES `questions`(`id`);
ALTER TABLE
    `questions` ADD CONSTRAINT `questions_question_set_id_foreign` FOREIGN KEY(`question_set_id`) REFERENCES `question_sets`(`id`);
ALTER TABLE
    `rooms` ADD CONSTRAINT `rooms_question_set_id_foreign` FOREIGN KEY(`question_set_id`) REFERENCES `question_sets`(`id`);
ALTER TABLE
    `players` ADD CONSTRAINT `players_room_id_foreign` FOREIGN KEY(`room_id`) REFERENCES `rooms`(`id`);
