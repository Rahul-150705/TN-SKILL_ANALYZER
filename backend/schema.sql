CREATE DATABASE IF NOT EXISTS skillgap_db;
USE skillgap_db;

CREATE TABLE companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(100) DEFAULT 'Automotive',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('HR', 'EMPLOYEE') NOT NULL,
    company_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE TABLE job_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE required_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(100),
    job_role_id BIGINT NOT NULL,
    FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE
);

CREATE TABLE employee_skill_analysis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    job_role_id BIGINT NOT NULL,
    resume_text LONGTEXT,
    detected_skills JSON,
    missing_skills JSON,
    matched_skills JSON,
    match_percentage DOUBLE,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (job_role_id) REFERENCES job_roles(id)
);

CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    provider VARCHAR(100),
    duration_weeks INT,
    course_url VARCHAR(500)
);

-- Pre-populate courses
INSERT INTO courses (skill_name, course_name, provider, duration_weeks, course_url) VALUES 
('Battery Management Systems', 'Advanced Battery Management Systems', 'Naan Mudhalvan', 8, 'https://example.com/bms'),
('Battery Assembly', 'EV Battery Assembly Techniques', 'TN AUTO Skills', 4, 'https://example.com/battery-assembly'),
('EV Diagnostics', 'Electric Vehicle Diagnostics & Repair', 'Government ITI', 12, 'https://example.com/ev-diagnostics'),
('CAN Bus Protocol', 'CAN Bus for Automotive Systems', 'NPTEL', 6, 'https://example.com/can-bus'),
('Electrical Safety', 'High Voltage Electrical Safety', 'NSDC', 2, 'https://example.com/electrical-safety'),
('Robotics Operation', 'Industrial Robotics for Manufacturing', 'Coursera', 10, 'https://example.com/robotics'),
('Python Programming', 'Python for Automotive Engineers', 'Naan Mudhalvan', 8, 'https://example.com/python'),
('ADAS Systems', 'Advanced Driver Assistance Systems', 'Coursera', 6, 'https://example.com/adas'),
('Thermal Management', 'Battery Thermal Management Systems', 'NPTEL', 8, 'https://example.com/thermal'),
('Industrial IoT', 'IoT in Automotive Manufacturing', 'TN AUTO Skills', 6, 'https://example.com/iiot'),
('Machine Learning basics', 'Machine Learning Foundations', 'Coursera', 10, 'https://example.com/ml'),
('CAD/CAM', 'CAD/CAM for Auto Components', 'Government ITI', 12, 'https://example.com/cadcam'),
('High Voltage Safety', 'HV Safety Certification', 'NSDC', 3, 'https://example.com/hv-safety'),
('OBD Systems', 'On-Board Diagnostics (OBD-II)', 'Naan Mudhalvan', 4, 'https://example.com/obd'),
('EV Charging Infrastructure', 'Charging Infrastructure Design', 'NPTEL', 8, 'https://example.com/ev-charging');
