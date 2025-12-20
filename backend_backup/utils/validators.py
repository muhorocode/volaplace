from flask import request
import re

def validate_email(email):
    '''validate email format'''
    pattern = r'^[a-za-z0-9._%+-]+@[a-za-z0-9.-]+\.[a-za-z]{2,}$'
    return bool(re.match(pattern, email))
