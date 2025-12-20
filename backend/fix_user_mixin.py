import sys
sys.path.insert(0, '.')

# Read and fix models.py
with open('app/models.py', 'r') as f:
    content = f.read()

# Add UserMixin import if not present
if 'from flask_login import UserMixin' not in content:
    content = 'from flask_login import UserMixin\n' + content

# Ensure User inherits from UserMixin
if 'class User(db.Model, UserMixin):' not in content:
    content = content.replace('class User(db.Model):', 'class User(db.Model, UserMixin):')

with open('app/models.py', 'w') as f:
    f.write(content)

print("✅ User model updated with UserMixin")
print("📋 Check: User should inherit from UserMixin")
