web: gunicorn typing_test_app:app --bind 0.0.0.0:$PORT --workers 3 --timeout 120
release: python -c "from typing_test_app import init_database; init_database()"
