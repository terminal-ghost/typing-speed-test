-- Typing Test Database Schema
-- SQLite database structure for the typing test web application

-- Create database (SQLite will create this automatically)
-- CREATE DATABASE typing_test;

-- Main table to store typing test results
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    wpm REAL NOT NULL,                    -- Words Per Minute
    accuracy REAL NOT NULL,               -- Accuracy percentage (0-100)
    time_taken REAL NOT NULL,             -- Time taken in seconds
    test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    text_used TEXT NOT NULL               -- The text that was typed
);

-- Table to store different text passages for testing
CREATE TABLE IF NOT EXISTS text_passages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1,   -- 1=Easy, 2=Medium, 3=Hard
    word_count INTEGER,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table to store user profiles (optional)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    best_wpm REAL DEFAULT 0,
    best_accuracy REAL DEFAULT 0,
    total_tests INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_test_results_username ON test_results(username);
CREATE INDEX IF NOT EXISTS idx_test_results_wpm ON test_results(wpm);
CREATE INDEX IF NOT EXISTS idx_test_results_date ON test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_text_passages_difficulty ON text_passages(difficulty_level);

-- Insert sample text passages
INSERT INTO text_passages (title, content, difficulty_level, word_count) VALUES
('Basic Alphabet', 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.', 1, 16),
('Programming Basics', 'Python is a high-level programming language known for its simplicity and readability. It supports multiple programming paradigms.', 2, 18),
('Web Development', 'Web development has evolved significantly with modern frameworks and technologies. Developers now use JavaScript, HTML, CSS, and various libraries.', 2, 21),
('Database Systems', 'Database management systems are essential for storing and retrieving information efficiently. SQL is the standard language for database operations.', 3, 21),
('Machine Learning', 'Machine learning algorithms can process vast amounts of data to identify patterns and make predictions without being explicitly programmed.', 3, 20),
('Computer Science', 'Computer science encompasses algorithm design, data structures, software engineering, and computational theory. It combines mathematical rigor with practical application.', 3, 23),
('Internet Technology', 'The internet has revolutionized communication and information sharing. TCP/IP protocols enable global connectivity and data transmission across networks.', 3, 21);

-- Insert sample test results (for demonstration)
INSERT INTO test_results (username, wpm, accuracy, time_taken, text_used) VALUES
('Alice', 65.5, 96.2, 45.3, 'The quick brown fox jumps over the lazy dog.'),
('Bob', 72.1, 94.8, 38.7, 'Python is a high-level programming language.'),
('Charlie', 58.9, 98.1, 52.1, 'Web development has evolved significantly.'),
('Diana', 78.4, 92.5, 41.2, 'Database management systems are essential.'),
('Eve', 69.7, 95.7, 43.8, 'Machine learning algorithms can process data.');

-- Useful queries for the application

-- Get top 10 fastest typists
-- SELECT username, MAX(wpm) as best_wpm, MAX(accuracy) as best_accuracy, COUNT(*) as tests_taken
-- FROM test_results 
-- GROUP BY username 
-- ORDER BY best_wpm DESC 
-- LIMIT 10;

-- Get user statistics
-- SELECT 
--     username,
--     AVG(wpm) as avg_wpm,
--     MAX(wpm) as best_wpm,
--     AVG(accuracy) as avg_accuracy,
--     MAX(accuracy) as best_accuracy,
--     COUNT(*) as total_tests
-- FROM test_results 
-- WHERE username = 'Alice'
-- GROUP BY username;

-- Get recent test results
-- SELECT username, wpm, accuracy, test_date
-- FROM test_results 
-- ORDER BY test_date DESC 
-- LIMIT 20;

-- Get tests by difficulty level
-- SELECT tr.username, tr.wpm, tr.accuracy, tp.difficulty_level
-- FROM test_results tr
-- JOIN text_passages tp ON tr.text_used = tp.content
-- WHERE tp.difficulty_level = 2;

-- Update user best scores (trigger or stored procedure alternative)
-- UPDATE users 
-- SET best_wpm = (SELECT MAX(wpm) FROM test_results WHERE username = users.username),
--     best_accuracy = (SELECT MAX(accuracy) FROM test_results WHERE username = users.username),
--     total_tests = (SELECT COUNT(*) FROM test_results WHERE username = users.username)
-- WHERE username IN (SELECT DISTINCT username FROM test_results);

-- Clean up old test results (optional maintenance)
-- DELETE FROM test_results 
-- WHERE test_date < datetime('now', '-1 year');
