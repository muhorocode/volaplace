from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from .config import db

# user table.
class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False) # e.g., 'admin', 'org_admin', 'volunteer'
    phone = db.Column(db.String(15), unique=True, nullable=False)
    mpesa_phone = db.Column(db.String(15))
    profile_completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationships
    # if a user is deleted, we cascade delete their organization and roster entries
    organization = db.relationship('Organization', back_populates='user', uselist=False, cascade="all, delete-orphan")
    volunteer_shifts = db.relationship('ShiftRoster', back_populates='volunteer', cascade="all, delete-orphan")
    transactions = db.relationship('TransactionLog', back_populates='volunteer', cascade="all, delete-orphan")
    
    # track who updated the rules (no cascade delete here to prevent deleting rules accidentally)
    rules_updated = db.relationship('GlobalRules', back_populates='admin')

    serialize_rules = (
        '-password_hash', 
        '-organization', 
        '-volunteer_shifts', 
        '-transactions'
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "password": self.password_hash,
            "role": self.role,
            "phone": self.phone,
            "mpesa_phone": self.mpesa_phone,
            "profile_complete": self.profile_completed,
            "created_at": self.created_at
        }
    
# orgnization table.
class Organization(db.Model, SerializerMixin):
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='organization')
    projects = db.relationship('Project', back_populates='organization', cascade='all, delete-orphan')

    serialize_rules = ('-user', '-projects.organization')

# project table.
class Project(db.Model, SerializerMixin):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    geofence_radius = db.Column(db.Integer, default=20) # in meters
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    organization = db.relationship('Organization', back_populates='projects')
    shifts = db.relationship('Shift', back_populates='project', cascade='all, delete-orphan')

    serialize_rules = ('-organization', '-shifts.project')

# shift table
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
    status = db.Column(db.String(20), default='pending') # pending, active, completed
    
    # Funding fields for pre-funded wallet model
    is_funded = db.Column(db.Boolean, default=False)
    funded_amount = db.Column(db.Float, default=0.0)
    funding_transaction_id = db.Column(db.String(100))  # M-Pesa transaction reference

    project = db.relationship('Project', back_populates='shifts')
    roster = db.relationship('ShiftRoster', back_populates='shift', cascade='all, delete-orphan')

    serialize_rules = ('-project.organization', '-project.shifts', '-roster')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat() if self.date else None,
            "start_time": self.start_time.strftime("%H:%M") if self.start_time else None,
            "end_time": self.end_time.strftime("%H:%M") if self.end_time else None,
            "max_volunteers": self.max_volunteers,
            "status": self.status,
            # Funding fields
            "is_funded": self.is_funded or False,
            "funded_amount": self.funded_amount or 0.0,
            "funding_transaction_id": self.funding_transaction_id,
            
            "project": {
                "name": self.project.name,
                "lat": self.project.lat,
                "lon": self.project.lon,
                "geofence_radius": self.project.geofence_radius
            } if self.project else None
        }

# shift roaster table.
class ShiftRoster(db.Model, SerializerMixin):
    __tablename__ = 'shifts_roster'

    id = db.Column(db.Integer, primary_key=True)
    shift_id = db.Column(db.Integer, db.ForeignKey('shifts.id', ondelete='CASCADE'), nullable=False)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    check_in_time = db.Column(db.DateTime)
    check_out_time = db.Column(db.DateTime)
    beneficiaries_served = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='scheduled') # scheduled, checked_in, completed, cancelled
    
    # Payment tracking
    payout_amount = db.Column(db.Float, default=0.0)
    is_paid = db.Column(db.Boolean, default=False)
    paid_at = db.Column(db.DateTime)

    shift = db.relationship('Shift', back_populates='roster')
    volunteer = db.relationship('User', back_populates='volunteer_shifts')

    # connect roster to the payment log
    payment_record = db.relationship('TransactionLog', back_populates='shift_roster', uselist=False)

    serialize_rules = ('-shift', '-volunteer')

# rules table
class GlobalRules(db.Model, SerializerMixin):
    __tablename__ = 'global_rules'

    id = db.Column(db.Integer, primary_key=True)
    base_hourly_rate = db.Column(db.Float, default=100.0)
    bonus_per_beneficiary = db.Column(db.Float, default=10.0)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    
    admin = db.relationship('User', back_populates='rules_updated')

# transaction logs - ready for payment.
class TransactionLog(db.Model, SerializerMixin):
    __tablename__ = 'transaction_log'

    id = db.Column(db.Integer, primary_key=True)
    volunteer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    shift_roster_id = db.Column(db.Integer, db.ForeignKey('shifts_roster.id', ondelete='CASCADE'))
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, completed, failed
    phone = db.Column(db.String(15), nullable=False)

    volunteer = db.relationship('User', back_populates='transactions')
    shift_roster = db.relationship('ShiftRoster', back_populates='payment_record')

    serialize_rules = ('-volunteer', '-shift_roster')

