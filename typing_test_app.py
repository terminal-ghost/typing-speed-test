#!/usr/bin/env python3
"""
Typing Test Web Application
A browser-based typing speed test application using Flask
"""

from flask import Flask, render_template, request, jsonify, session
import sqlite3
import time
import random
from datetime import datetime
import hashlib
from flask_mail import Mail, Message
import os

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'your-email@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'your-app-password')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'Keyzio <your-email@gmail.com>')

# Initialize Flask-Mail
mail = Mail(app)

# Word banks for generating random sentences
WORD_BANKS = {
    'subjects': ['The experienced developer', 'A skilled programmer', 'The innovative engineer', 'Every software architect', 'The dedicated coder', 'A passionate technologist', 'The creative designer', 'Each project manager', 'The analytical thinker', 'A problem solver', 'The team leader', 'Every database administrator', 'The security expert', 'A full-stack developer', 'The system administrator'],
    'verbs': ['carefully designs', 'efficiently implements', 'thoroughly tests', 'successfully deploys', 'quickly debugs', 'strategically plans', 'methodically refactors', 'consistently maintains', 'regularly updates', 'systematically optimizes', 'effectively manages', 'precisely configures', 'skillfully integrates', 'continuously monitors', 'proactively secures'],
    'objects': ['complex web applications', 'scalable microservices', 'robust database systems', 'intuitive user interfaces', 'efficient algorithms', 'secure authentication systems', 'responsive mobile applications', 'automated testing frameworks', 'cloud infrastructure solutions', 'real-time data processing pipelines', 'comprehensive API endpoints', 'interactive dashboard components', 'distributed computing systems', 'machine learning models', 'enterprise software solutions'],
    'contexts': ['using modern frameworks and cutting-edge technologies', 'following industry best practices and coding standards', 'while ensuring optimal performance and user experience', 'by leveraging cloud computing and containerization', 'through collaborative development and agile methodologies', 'with emphasis on security and data protection', 'incorporating automated testing and continuous integration', 'focusing on maintainability and code quality', 'utilizing version control and deployment automation', 'while considering scalability and future requirements', 'by implementing responsive design principles', 'through careful analysis of user requirements', 'using efficient data structures and algorithms', 'with attention to accessibility and usability', 'following DevOps practices and monitoring protocols']
}

def generate_random_text():
    """Generate a random text passage of appropriate length"""
    import random
    
    sentences = []
    target_length = random.randint(250, 400)  # Target character count
    current_length = 0
    
    while current_length < target_length and len(sentences) < 8:
        subject = random.choice(WORD_BANKS['subjects'])
        verb = random.choice(WORD_BANKS['verbs'])
        obj = random.choice(WORD_BANKS['objects'])
        context = random.choice(WORD_BANKS['contexts'])
        
        sentence = f"{subject} {verb} {obj} {context}."
        sentences.append(sentence)
        current_length += len(sentence) + 1  # +1 for space
    
    return ' '.join(sentences)

def init_database():
    """Initialize the SQLite database with required tables"""
    conn = sqlite3.connect('typing_test.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Create test_results table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            wpm REAL,
            accuracy REAL,
            time_taken REAL,
            test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            text_used TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create feedback table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            email TEXT,
            feedback_text TEXT NOT NULL,
            feedback_type TEXT DEFAULT 'general',
            submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Check if user_id column exists in test_results table (migration)
    cursor.execute("PRAGMA table_info(test_results)")
    columns = [column[1] for column in cursor.fetchall()]
    
    migration_needed = False
    
    if 'user_id' not in columns:
        print("Adding user_id column to test_results table...")
        cursor.execute('ALTER TABLE test_results ADD COLUMN user_id INTEGER')
        migration_needed = True
    
    if 'text_used' not in columns:
        print("Adding text_used column to test_results table...")
        cursor.execute('ALTER TABLE test_results ADD COLUMN text_used TEXT')
        migration_needed = True
    
    if migration_needed:
        print("Database migration completed!")
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return hash_password(password) == password_hash

def send_welcome_email(username, email, password):
    """Send welcome email to new user with account details"""
    try:
        msg = Message(
            subject='Welcome to Keyzio - Your Account Details',
            recipients=[email],
            html=f'''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Keyzio</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                    .header h1 {{ margin: 0; font-size: 24px; }}
                    .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                    .account-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }}
                    .account-details h3 {{ margin-top: 0; color: #667eea; }}
                    .detail-row {{ margin: 10px 0; padding: 8px; background: #f0f0f0; border-radius: 4px; }}
                    .warning {{ background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7; }}
                    .footer {{ text-align: center; margin-top: 30px; font-size: 14px; color: #666; }}
                    .btn {{ display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>⌨️ Welcome to Keyzio!</h1>
                    <p>Your account has been successfully created</p>
                </div>
                <div class="content">
                    <p>Hello <strong>{username}</strong>,</p>
                    
                    <p>Welcome to Keyzio! We're excited to have you join our community of typing enthusiasts. Your account has been successfully created and you can now start improving your typing skills.</p>
                    
                    <div class="account-details">
                        <h3>🔐 Your Account Details</h3>
                        <div class="detail-row">
                            <strong>Username:</strong> {username}
                        </div>
                        <div class="detail-row">
                            <strong>Email:</strong> {email}
                        </div>
                        <div class="detail-row">
                            <strong>Password:</strong> {password}
                        </div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Important Security Notice</strong>
                        <p>Please keep this information confidential and do not share your login credentials with anyone. For your security, we recommend:</p>
                        <ul>
                            <li>Changing your password after your first login</li>
                            <li>Using a strong, unique password</li>
                            <li>Not sharing your account details with others</li>
                            <li>Deleting this email after noting down your credentials</li>
                        </ul>
                    </div>
                    
                    <p>Now you can:</p>
                    <ul>
                        <li>✨ Take unlimited typing tests</li>
                        <li>📊 Track your progress over time</li>
                        <li>🏆 Compete on the global leaderboard</li>
                        <li>📈 View detailed statistics</li>
                    </ul>
                    
                    <p>Ready to start your typing journey?</p>
                    <a href="http://localhost:8081/test" class="btn">Start Your First Test</a>
                    
                    <div class="footer">
                        <p>Thank you for joining Keyzio!</p>
                        <p>If you have any questions, feel free to contact us.</p>
                        <p><small>This is an automated message. Please do not reply to this email.</small></p>
                    </div>
                </div>
            </body>
            </html>
            '''
        )
        mail.send(msg)
        print(f"Welcome email sent successfully to {email}")
        return True
    except Exception as e:
        print(f"Failed to send welcome email to {email}: {str(e)}")
        return False

@app.route('/')
def landing():
    """Landing page with navigation"""
    return render_template('landing.html')

@app.route('/test')
def test():
    """Typing test interface"""
    return render_template('index.html')

@app.route('/get_text')
def get_text():
    """API endpoint to get random text for typing test"""
    text = generate_random_text()
    session['current_text'] = text
    session['start_time'] = time.time()
    return jsonify({'text': text})

@app.route('/submit_test', methods=['POST'])
def submit_test():
    """API endpoint to submit typing test results"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data received'}), 400
        
        # Calculate metrics
        typed_text = data.get('typed_text', '')
        if not typed_text:
            return jsonify({'success': False, 'error': 'No typed text provided'}), 400
            
        end_time = time.time()
        start_time = session.get('start_time', end_time)
        original_text = session.get('current_text', '')
        
        if not original_text:
            return jsonify({'success': False, 'error': 'No original text found in session'}), 400
        
        time_taken = max(end_time - start_time, 1)  # Ensure minimum 1 second
        word_count = len(typed_text.split()) if typed_text.strip() else 1
        wpm = (word_count / time_taken) * 60 if time_taken > 0 else 0
        
        # Calculate accuracy
        accuracy = calculate_accuracy(original_text, typed_text)
        
        # Determine username based on authentication status
        if 'user_id' in session:
            username = session['username']
            user_id = session['user_id']
        else:
            username = data.get('username', 'Anonymous')
            user_id = None
        
        # Save to database
        save_result(username, wpm, accuracy, time_taken, original_text, user_id)
        
        return jsonify({
            'success': True,
            'wpm': round(wpm, 2),
            'accuracy': round(accuracy, 2),
            'time_taken': round(time_taken, 2)
        })
        
    except Exception as e:
        print(f"Error in submit_test: {str(e)}")
        return jsonify({'success': False, 'error': f'Server error: {str(e)}'}), 500

def calculate_accuracy(original, typed):
    """Calculate typing accuracy percentage"""
    if not original or not typed:
        return 0.0
    
    original_chars = list(original.lower())
    typed_chars = list(typed.lower())
    
    correct_chars = 0
    total_chars = len(original_chars)
    
    for i in range(min(len(original_chars), len(typed_chars))):
        if original_chars[i] == typed_chars[i]:
            correct_chars += 1
    
    # Penalize for extra or missing characters
    if len(typed_chars) != len(original_chars):
        penalty = abs(len(typed_chars) - len(original_chars))
        correct_chars = max(0, correct_chars - penalty)
    
    return (correct_chars / total_chars) * 100 if total_chars > 0 else 0.0

def save_result(username, wpm, accuracy, time_taken, text_used, user_id=None):
    """Save test result to database"""
    try:
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO test_results (user_id, username, wpm, accuracy, time_taken, text_used)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, username, wpm, accuracy, time_taken, text_used))
        
        conn.commit()
        conn.close()
        print(f"Successfully saved result for user: {username}, WPM: {wpm}, Accuracy: {accuracy}%")
        
    except sqlite3.Error as e:
        print(f"Database error in save_result: {str(e)}")
        if 'conn' in locals():
            conn.close()
        raise Exception(f"Failed to save test result: {str(e)}")
    except Exception as e:
        print(f"Unexpected error in save_result: {str(e)}")
        if 'conn' in locals():
            conn.close()
        raise

@app.route('/leaderboard')
def leaderboard():
    """Display top typing test scores"""
    try:
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT username, MAX(wpm) as best_wpm, MAX(accuracy) as best_accuracy, 
                   COUNT(*) as tests_taken
            FROM test_results 
            WHERE username IS NOT NULL AND username != ''
            GROUP BY username 
            ORDER BY best_wpm DESC 
            LIMIT 10
        ''')
        
        results = cursor.fetchall()
        conn.close()
        
        return jsonify([{
            'username': row[0],
            'wpm': round(row[1], 1),  # Round to 1 decimal place
            'accuracy': round(row[2], 1),  # Round to 1 decimal place
            'tests_taken': row[3]
        } for row in results])
        
    except Exception as e:
        print(f"Error in leaderboard: {str(e)}")
        return jsonify([]), 500

@app.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required'})
    
    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'})
    
    try:
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Username or email already exists'})
        
        # Create new user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Send welcome email with account details
        email_sent = send_welcome_email(username, email, password)
        
        # Log user in
        session['user_id'] = user_id
        session['username'] = username
        session['email'] = email
        
        success_message = 'Registration successful!'
        if email_sent:
            success_message += ' A welcome email with your account details has been sent to your email address.'
        else:
            success_message += ' Note: Welcome email could not be sent, but your account was created successfully.'
        
        return jsonify({
            'success': True, 
            'message': success_message,
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Registration failed. Please try again.'})

@app.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'})
    
    try:
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        # Find user by username or email
        cursor.execute('''
            SELECT id, username, email, password_hash 
            FROM users 
            WHERE username = ? OR email = ?
        ''', (username, username))
        
        user = cursor.fetchone()
        
        if user and verify_password(password, user[3]):
            # Update last login
            cursor.execute('''
                UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
            ''', (user[0],))
            conn.commit()
            
            # Set session
            session['user_id'] = user[0]
            session['username'] = user[1]
            session['email'] = user[2]
            
            conn.close()
            
            return jsonify({
                'success': True, 
                'message': 'Login successful!',
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2]
                }
            })
        else:
            conn.close()
            return jsonify({'success': False, 'message': 'Invalid username/email or password'})
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Login failed. Please try again.'})

@app.route('/logout', methods=['POST'])
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/check_auth')
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'email': session['email']
            }
        })
    else:
        return jsonify({'authenticated': False})

@app.route('/check_username', methods=['POST'])
def check_username():
    """Check if a username already exists"""
    data = request.json
    username = data.get('username', '').strip()
    
    if not username:
        return jsonify({'exists': False})
    
    try:
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        # Check in both users table and test_results table for guest names
        cursor.execute('''
            SELECT 1 FROM users WHERE username = ?
            UNION
            SELECT 1 FROM test_results WHERE username = ? AND user_id IS NULL
        ''', (username, username))
        
        exists = cursor.fetchone() is not None
        conn.close()
        
        return jsonify({'exists': exists})
        
    except Exception as e:
        print(f"Error checking username: {str(e)}")
        return jsonify({'exists': False})

@app.route('/api/stats')
def api_stats():
    """Get overall application statistics"""
    try:
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        # Get total tests
        cursor.execute('SELECT COUNT(*) FROM test_results')
        total_tests = cursor.fetchone()[0]
        
        # Get unique users (both registered and guests)
        cursor.execute('SELECT COUNT(DISTINCT username) FROM test_results')
        total_users = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'totalTests': total_tests,
            'totalUsers': total_users
        })
        
    except Exception as e:
        print(f"Error getting stats: {str(e)}")
        return jsonify({
            'totalTests': 0,
            'totalUsers': 0
        })

@app.route('/stats/<username>')
def user_stats(username):
    """Get statistics for a specific user"""
    conn = sqlite3.connect('typing_test.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT AVG(wpm), MAX(wpm), AVG(accuracy), MAX(accuracy), COUNT(*)
        FROM test_results 
        WHERE username = ?
    ''', (username,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result and result[0] is not None:
        return jsonify({
            'avg_wpm': round(result[0], 2),
            'best_wpm': round(result[1], 2),
            'avg_accuracy': round(result[2], 2),
            'best_accuracy': round(result[3], 2),
            'total_tests': result[4]
        })
    else:
        return jsonify({'error': 'No data found for this user'})

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    """Submit user feedback"""
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data received'}), 400
        
        feedback_text = data.get('feedback', '').strip()
        feedback_type = data.get('type', 'general').strip()
        
        if not feedback_text:
            return jsonify({'success': False, 'error': 'Feedback text is required'}), 400
        
        if len(feedback_text) < 10:
            return jsonify({'success': False, 'error': 'Feedback must be at least 10 characters long'}), 400
        
        if len(feedback_text) > 5000:
            return jsonify({'success': False, 'error': 'Feedback must be less than 5000 characters'}), 400
        
        # Get user info if logged in
        user_id = session.get('user_id')
        username = session.get('username', 'Anonymous')
        email = session.get('email')
        
        # Get client info
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        
        # Save feedback to database
        conn = sqlite3.connect('typing_test.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO feedback (user_id, username, email, feedback_text, feedback_type, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (user_id, username, email, feedback_text, feedback_type, ip_address, user_agent))
        
        feedback_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Write feedback to text file for backup
        try:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            feedback_entry = f"\n--- Feedback ID: {feedback_id} ---\n"
            feedback_entry += f"Date: {timestamp}\n"
            feedback_entry += f"User: {username} ({email or 'No email'})\n"
            feedback_entry += f"Type: {feedback_type}\n"
            feedback_entry += f"IP: {ip_address}\n"
            feedback_entry += f"Feedback: {feedback_text}\n"
            feedback_entry += "-" * 50 + "\n"
            
            with open('feedback.txt', 'a', encoding='utf-8') as f:
                f.write(feedback_entry)
        except Exception as e:
            print(f"Warning: Could not write to feedback file: {str(e)}")
        
        print(f"Feedback submitted by {username} (ID: {feedback_id}): {feedback_text[:100]}...")
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your feedback! We appreciate your input and will use it to improve Keyzio.',
            'feedback_id': feedback_id
        })
        
    except Exception as e:
        print(f"Error submitting feedback: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to submit feedback. Please try again.'}), 500

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    print("Starting Typing Test Web Application...")
    print("Visit http://localhost:8081 to start typing!")
    app.run(debug=True, host='0.0.0.0', port=8081)
