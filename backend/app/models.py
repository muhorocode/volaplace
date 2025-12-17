from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    mpesa_phone = db.Column(db.String(15))
    profile_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relatoinships
    organization = db.relationship('Organization', back_populates='user', uselist=False)
    volunteer_shifts = db.relationship('ShiftRoster', back_populates='volunteer')
    transactions = db.relationship('TransactionLog', back_populates='volunteer')

    serialize_rules = ('-password_hash', '-organization.user', '-volunteer_shifts.volunteer', '-transactions.volunteer')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Organization(db.Model, SerializerMixin):
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='organization')
    projects = db.relationship('Project', back_populates='organization', cascade='all, delete-orphan')

    serialize_rules = ('-user.organization', '-projects.organization')

class Project(db.Model, SerializerMixin):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    geofence_radius = db.Column(db.Integer, default=20)
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organization = db.relationship('Organization', back_populates='projects')
    shifts = db.relationship('Shift', back_populates='project', cascade='all, delete-orphan')

    serialize_rules = ('-organization.projects', '-shifts.project')

class Shift(db.Model, SerializerMixin): 
    __tablename__ = 'shifts'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text) 
    
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    max_volunteers = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    project = db.relationship('Project', back_populates='shifts')
    roster = db.relationship('ShiftRoster', back_populates='shift', cascade='all, delete-orphan')

    serialize_rules = ('-project.shifts', '-roster.shift')
class ShiftRoster(db.Model, SerializerMixin):
    __tablename__ = 'shifts_roster'

    id = db.Column(db.Integer, primary_key=True)
    shift_id = db.Column(db.Integer, db.ForeignKey('shifts.id', ondelete='CASCADE'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_out_time = db.Column(db.DateTime)
    beneficiaries_served = db.Column(db.Integer, default=0)
    
    status = db.Column(db.String(20), default='scheduled')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    shift = db.relationship('Shift', back_populates='roster')
    volunteer = db.relationship('User', back_populates='volunteer_shifts')

    serialize_rules = ('-shift.roster', '-volunteer.volunteer_shifts')
class GlobalRules(db.Model, SerializerMixin):
    __tablename__ = 'global_rules'

    id = db.Column(db.Integer, primary_key=True)
    base_hourly_rate = db.Column(db.Float, default=100.0)
    bonus_per_beneficiary = db.Column(db.Float, default=10.0)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'))

class TransactionLog(db.Model, SerializerMixin):
    __tablename__ = 'transaction_log'

    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    shift_roster_id = db.Column(db.Integer, db.ForeignKey('shifts_roster.id', ondelete='SET NULL'))
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    phone = db.Column(db.String(15), nullable=False)

    volunteer = db.relationship('User', back_populates='transactions')


    
