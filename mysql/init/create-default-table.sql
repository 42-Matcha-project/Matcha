CREATE DATABASE IF NOT EXISTS matcha;
USE matcha;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id              INT AUTO_INCREMENT NOT NULL,
    username        VARCHAR(20) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        CHAR(60) NOT NULL,
    gender          ENUM('male', 'female') NOT NULL,
    introduction    VARCHAR(255),
    icon_image_url  VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

INSERT INTO users (username, email, password, gender, introduction, icon_image_url)
VALUES
    ('kai', 'kai@example.com', 'hashed_password_1', 'male', 'Hello, I am Kai.', 'https://example.com/kai.png');
