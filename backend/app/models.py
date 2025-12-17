from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model, SerializerMixin): # user table.
    tablename = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'volunteer', 'organization', 'admin'
    phone = db.Column(db.String(15), unique=True, nullable=False)
    mpesa_phone = db.Column(db.String(15))
    profile_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='user', uselist=False)
    volunteer_shifts = db.relationship('ShiftRoster', back_populates='volunteer')
    transactions = db.relationship('TransactionLog', back_populates='volunteer')

    serialize_rules = ('-password_hash', '-organization.user', '-volunteer_shifts.volunteer', 
                    '-transactions.volunteer')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @validates('role')
    def validate_role(self, key, role):
        valid_roles = ['volunteer', 'organization', 'admin']
        if role not in valid_roles:
            raise ValueError(f"Role must be one of: {valid_roles}")
        return role

    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email:
            raise ValueError("Invalid email address")
        return email.lower()

    def __repr__(self):
        return f'<User {self.email} ({self.role})>'
    
class Organization(db.Model, SerializerMixin):# organization table.
    tablename = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='organization')
    projects = db.relationship('Project', back_populates='organization', cascade='all, delete-orphan')

    serialize_rules = ('-user.organization', '-projects.organization')

    @validates('name')
    def validate_name(self, key, name):
        if len(name) < 2:
            raise ValueError("Organization name must be at least 2 characters")
        return name

    def __repr__(self):
        return f'<Organization {self.name}>'
    
class Project(db.Model, SerializerMixin): # projects table.
    tablename = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    lat = db.Column(db.Float, nullable=False)  # Latitude
    lon = db.Column(db.Float, nullable=False)  # Longitude
    geofence_radius = db.Column(db.Integer, default=20)  # Meters
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='projects')
    shifts = db.relationship('Shift', back_populates='project', cascade='all, delete-orphan')

    serialize_rules = ('-organization.projects', '-shifts.project')

    @validates('lat')
    def validate_lat(self, key, lat):
        if not (-90 <= lat <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        return lat

    @validates('lon')
    def validate_lon(self, key, lon):
        if not (-180 <= lon <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return lon

    @validates('geofence_radius')
    def validate_radius(self, key, radius):
        if radius < 1 or radius > 1000:
            raise ValueError("Geofence radius must be between 1 and 1000 meters")
        return radius

    def __repr__(self):
        return f'<Project {self.name} ({self.lat}, {self.lon})>'
    
class Shift(db.Model, SerializerMixin): # shift table.
    tablename = 'shifts'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    max_volunteers = db.Column(db.Integer)
    status = db.Column(db.String(20), default='pending')  # pending, active, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    project = db.relationship('Project', back_populates='shifts')
    roster = db.relationship('ShiftRoster', back_populates='shift', cascade='all, delete-orphan')

    serialize_rules = ('-project.shifts', '-roster.shift')

    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['pending', 'active', 'completed', 'cancelled']
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of: {valid_statuses}")
        return status

    @validates('end_time')
    def validate_end_time(self, key, end_time):
        if hasattr(self, 'start_time') and end_time <= self.start_time:
            raise ValueError("End time must be after start time")
        return end_time

    @validates('max_volunteers')
    def validate_max_volunteers(self, key, max_volunteers):
        if max_volunteers is not None and max_volunteers < 1:
            raise ValueError("Maximum volunteers must be at least 1")
        return max_volunteers

    def __repr__(self):
        return f'<Shift {self.title} ({self.date})>'
    
class ShiftRoster(db.Model, SerializerMixin): # shift roaster table.
    tablename = 'shifts_roster'

    id = db.Column(db.Integer, primary_key=True)
    shift_id = db.Column(db.Integer, db.ForeignKey('shifts.id', ondelete='CASCADE'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_out_time = db.Column(db.DateTime)
    beneficiaries_served = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, checked_in, checked_out, paid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    shift = db.relationship('Shift', back_populates='roster')
    volunteer = db.relationship('User', back_populates='volunteer_shifts')

    serialize_rules = ('-shift.roster', '-volunteer.volunteer_shifts')

    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['scheduled', 'checked_in', 'checked_out', 'paid']
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of: {valid_statuses}")
        return status

    @validates('beneficiaries_served')
    def validate_beneficiaries(self, key, count):
        if count < 0:
            raise ValueError("Beneficiaries served cannot be negative")
        return count

    @validates('check_out_time')
    def validate_check_out_time(self, key, check_out_time):
        if check_out_time and self.check_in_time and check_out_time <= self.check_in_time:
            raise ValueError("Check-out time must be after check-in time")
        return check_out_time

    def __repr__(self):
        return f'<ShiftRoster Shift:{self.shift_id} Volunteer:{self.volunteer_id}>'

class GlobalRules(db.Model, SerializerMixin):# global rules
    tablename = 'global_rules'

    id = db.Column(db.Integer, primary_key=True)
    base_hourly_rate = db.Column(db.Float, nullable=False, default=100.0)  # Base rate in KES
    bonus_per_beneficiary = db.Column(db.Float, nullable=False, default=10.0)  # Bonus per person in KES
    min_checkin_distance = db.Column(db.Integer, default=20)  # Meters
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'))

    serialize_rules = ()

    @validates('base_hourly_rate')
    def validate_base_rate(self, key, rate):
        if rate < 0:
            raise ValueError("Base hourly rate cannot be negative")
        return rate

    @validates('bonus_per_beneficiary')
    def validate_bonus(self, key, bonus):
        if bonus < 0:
            raise ValueError("Bonus per beneficiary cannot be negative")
        return bonus

    def __repr__(self):
        return f'<GlobalRules Base:{self.base_hourly_rate} Bonus:{self.bonus_per_beneficiary}>'
    
class TransactionLog(db.Model, SerializerMixin): #transaction log
    tablename = 'transaction_log'

    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    shift_roster_id = db.Column(db.Integer, db.ForeignKey('shifts_roster.id', ondelete='SET NULL'))
    amount = db.Column(db.Float, nullable=False)
    mpesa_code = db.Column(db.String(50))  # M-Pesa transaction code
    status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    phone = db.Column(db.String(15), nullable=False)
    description = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)

    # Relationships
    volunteer = db.relationship('User', back_populates='transactions')
    shift_roster = db.relationship('ShiftRoster')

    serialize_rules = ('-volunteer.transactions', '-shift_roster')

    @validates('status')
    def validate_status(self, key, status):
        valid_statuses = ['pending', 'processing', 'completed', 'failed']
        if status not in valid_statuses:
            raise ValueError(f"Status must be one of: {valid_statuses}")
        return status

    @validates('amount')
    def validate_amount(self, key, amount):
        if amount <= 0:
            raise ValueError("Amount must be positive")
        return amount

    def __repr__(self):
        return f'<TransactionLog {self.mpesa_code} KES{self.amount} ({self.status})>'


    
