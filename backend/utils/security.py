from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    '''hash password for storage'''
    return generate_password_hash(password)

def verify_password(hashed_password, password):
    '''verify password against hash'''
    return check_password_hash(hashed_password, password)
