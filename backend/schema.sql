CREATE DATABASE IF NOT EXISTS skillgap_db;
USE skillgap_db;

DROP TABLE IF EXISTS employee_skill_analysis;
DROP TABLE IF EXISTS student_analysis;
DROP TABLE IF EXISTS required_skills;
DROP TABLE IF EXISTS job_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS courses;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'STUDENT') NOT NULL,
    admin_code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    basic_requirements TEXT,
    description TEXT,
    admin_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE required_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(255) NOT NULL,
    job_role_id BIGINT NOT NULL,
    FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE
);

CREATE TABLE student_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_role_id BIGINT NOT NULL,
    admin_id BIGINT NOT NULL,
    resume_text LONGTEXT,
    match_percentage DOUBLE,
    matched_skills JSON,
    missing_skills JSON,
    partial_skills JSON,
    certifications_score DOUBLE,
    responsiveness_score DOUBLE,
    creativity_score DOUBLE,
    technical_skills_score DOUBLE,
    recommendation_summary TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    platform VARCHAR(100),
    skills_covered JSON,
    course_link VARCHAR(500)
);

-- Pre-populate courses based on prompt details
INSERT INTO courses (course_name, platform, skills_covered, course_link) VALUES 
('Advanced Battery Management Systems', 'Naan Mudhalvan', '["Battery Management Systems", "BMS"]', 'https://example.com/bms'),
('EV Battery Assembly Techniques', 'TN AUTO Skills', '["Battery Assembly", "Assembly"]', 'https://example.com/battery-assembly'),
('Electric Vehicle Diagnostics & Repair', 'Government ITI', '["EV Diagnostics", "Repair", "Diagnostics"]', 'https://example.com/ev-diagnostics'),
('CAN Bus for Automotive Systems', 'NPTEL', '["CAN Bus Protocol", "CAN"]', 'https://example.com/can-bus'),
('High Voltage Electrical Safety', 'NSDC', '["Electrical Safety", "High Voltage"]', 'https://example.com/electrical-safety'),
('Industrial Robotics for Manufacturing', 'Coursera', '["Robotics Operation", "Robotics"]', 'https://example.com/robotics'),
('Python for Automotive Engineers', 'Naan Mudhalvan', '["Python Programming", "Python"]', 'https://example.com/python'),
('Advanced Driver Assistance Systems', 'Coursera', '["ADAS Systems", "ADAS"]', 'https://example.com/adas'),
('Battery Thermal Management Systems', 'NPTEL', '["Thermal Management", "Thermal"]', 'https://example.com/thermal'),
('IoT in Automotive Manufacturing', 'TN AUTO Skills', '["Industrial IoT", "IoT"]', 'https://example.com/iiot'),
('Machine Learning Foundations', 'Coursera', '["Machine Learning basics", "Machine Learning", "ML"]', 'https://example.com/ml'),
('CAD/CAM for Auto Components', 'Government ITI', '["CAD", "CAM", "CAD/CAM"]', 'https://example.com/cadcam'),
('HV Safety Certification', 'NSDC', '["High Voltage Safety", "Safety"]', 'https://example.com/hv-safety'),
('On-Board Diagnostics (OBD-II)', 'Naan Mudhalvan', '["OBD Systems", "OBD", "OBD-II"]', 'https://example.com/obd'),
('Charging Infrastructure Design', 'NPTEL', '["EV Charging Infrastructure", "Charging"]', 'https://example.com/ev-charging');
