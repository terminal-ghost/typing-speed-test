# ⚡ Typing Speed Test Website

A modern, responsive web application for testing typing speed and accuracy. Built with Flask (Python) backend and vanilla JavaScript frontend.

## Features

### 🚀 **Authentication System**
- **Signup/Login Modal**: Automatic popup on first visit
- **User Registration**: Create account with username, email, and password
- **Email Notifications**: Welcome emails with account details sent on signup
- **User Login**: Login with username/email and password
- **Guest Mode**: Skip authentication and use as anonymous user
- **Session Management**: Remember logged-in users across browser sessions

### 📊 **Typing Test**
- **Real-time Statistics**: WPM, accuracy, time, and error tracking
- **Multiple Time Limits**: 30 seconds, 1 minute, 2 minutes, 5 minutes, or no limit
- **Dynamic Text Generation**: Programming-themed text passages
- **Visual Feedback**: Color-coded correct/incorrect characters
- **Progress Tracking**: Real-time progress bar

### 📈 **Progress Tracking**
- **Personal Statistics**: Average/best WPM, accuracy, and test count
- **Leaderboard**: Top 10 global rankings
- **Test History**: All results saved to database
- **User Profiles**: Track progress for registered users

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Interface**: Modern, minimalist design
- **Smooth Animations**: Engaging user experience
- **Keyboard Shortcuts**: ESC to close modals, Enter to submit forms

### 📧 **Email System**
- **Welcome Emails**: Automatic emails sent on user registration
- **Account Details**: Username and password included in welcome email
- **Security Warnings**: Instructions about keeping credentials safe
- **HTML Templates**: Professional, styled email templates
- **SMTP Configuration**: Support for Gmail, Outlook, Yahoo, and custom SMTP servers

### 💬 **Feedback System**
- **Floating Feedback Icon**: Always-visible feedback button in bottom-right corner
- **Animated Pulsing**: Eye-catching animation to encourage feedback
- **Multiple Feedback Types**: General feedback, bug reports, feature requests, suggestions, compliments, complaints
- **Character Limit**: 5000 character limit with real-time counter
- **Database Storage**: All feedback stored in SQLite database with timestamps
- **File Backup**: Feedback also saved to `feedback.txt` file
- **Anonymous Support**: Works for both authenticated users and guests
- **Success Confirmation**: User-friendly confirmation after submission

## Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package installer)

### Quick Start

1. **Clone/Download the project files**
   ```bash
   # If you have the files, navigate to the project directory
   cd /path/to/typing-test
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv typing_test_env
   source typing_test_env/bin/activate  # On Windows: typing_test_env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python typing_test_app.py
   ```

5. **Configure Email (Optional)**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env file with your email settings
   # For Gmail, use your app password (not regular password)
   ```

6. **Open in browser**
   - Go to `http://localhost:8081`
   - The signup/login modal will appear automatically for new users

## Usage

### First Visit
1. **Signup Modal**: When you first visit, you'll see a welcome modal
   - **Sign Up**: Create a new account to track your progress
   - **Login**: If you already have an account
   - **Continue as Guest**: Skip authentication for anonymous testing

### Taking a Test
1. **Select Time Limit**: Choose your preferred test duration
2. **Click "Start Test"**: Begin typing the displayed text
3. **Type Away**: Match the text as accurately and quickly as possible
4. **View Results**: See your WPM, accuracy, and other stats

### Features for Registered Users
- **Automatic Progress Tracking**: All tests linked to your account
- **Personal Statistics**: View your typing improvement over time
- **Leaderboard Participation**: Compete with other users
- **Session Persistence**: Stay logged in across browser sessions

### Features for Guest Users
- **Anonymous Testing**: Take tests without creating an account
- **Session Results**: View results for current session
- **Manual Stats**: Enter username to view historical stats (if any)

## File Structure

```
typing-test/
├── typing_test_app.py          # Main Flask application
├── requirements.txt            # Python dependencies
├── typing_test_schema.sql      # Database schema and sample data
├── .env.example               # Environment variables template
├── templates/
│   ├── index.html             # Main typing test interface
│   └── landing.html           # Landing page template
├── static/
│   ├── css/
│   │   ├── style.css          # Main application styling
│   │   └── landing.css        # Landing page styling
│   └── js/
│       ├── app.js             # Main application JavaScript
│       └── landing.js         # Landing page JavaScript
├── typing_test_env/           # Virtual environment (auto-created)
└── typing_test.db             # SQLite database (created automatically)
```

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Hashed password
- `created_date`: Account creation timestamp
- `last_login`: Last login timestamp

### Test Results Table
- `id`: Primary key
- `user_id`: Foreign key to users (null for guest users)
- `username`: Username for display
- `wpm`: Words per minute
- `accuracy`: Typing accuracy percentage
- `time_taken`: Test duration in seconds
- `test_date`: Test completion timestamp
- `text_used`: The text that was typed

### Feedback Table
- `id`: Primary key
- `user_id`: Foreign key to users (null for guest users)
- `username`: Username for display
- `email`: User email (if available)
- `feedback_text`: The feedback message content
- `feedback_type`: Type of feedback (general, bug, feature, etc.)
- `submitted_date`: Feedback submission timestamp
- `ip_address`: User's IP address
- `user_agent`: User's browser information

## Customization

### Adding New Text Passages
Edit the `WORD_BANKS` dictionary in `typing_test_app.py`:
```python
WORD_BANKS = {
    'subjects': ['Your subjects here...'],
    'verbs': ['Your verbs here...'],
    'objects': ['Your objects here...'],
    'contexts': ['Your contexts here...']
}
```

### Changing Time Limits
Modify the time limit options in `templates/index.html`:
```html
<select id="timeLimit">
    <option value="30">30 seconds</option>
    <option value="60">1 minute</option>
    <!-- Add your custom time limits -->
</select>
```

### Styling Customization
Edit `static/css/style.css` to change colors, fonts, and layout.

## Security Features

- **Password Hashing**: SHA-256 hashing for password security
- **Session Management**: Secure Flask sessions
- **Input Validation**: Frontend and backend validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Safe HTML rendering

## Browser Compatibility

- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+

## Mobile Support

- Responsive design works on all screen sizes
- Touch-friendly interface
- Optimized for mobile typing

## Performance

- **Fast Loading**: Minimal dependencies
- **Real-time Updates**: 100ms update intervals during tests
- **Efficient Database**: SQLite for fast local storage
- **Optimized Frontend**: Vanilla JavaScript for speed

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in typing_test_app.py
   app.run(debug=True, host='0.0.0.0', port=8081)  # Use different port
   ```

2. **Database Issues**
   - Delete `typing_test.db` file to reset database
   - The application will recreate tables automatically

3. **Authentication Problems**
   - Clear browser cookies/localStorage
   - Restart the Flask application

### Debug Mode
The application runs in debug mode by default for development. For production:
```python
app.run(debug=False, host='0.0.0.0', port=8080)
```

## Contributing

Feel free to:
- Add new features
- Improve the UI/UX
- Fix bugs
- Add more text content
- Enhance security

## License

This project is open source and available under the MIT License.

---

**Happy Typing! 🎯**

*Test your skills, track your progress, and improve your typing speed with this modern web application.*
