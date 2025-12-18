from app import create_app
from extensions import db
from app.models import User, Organization, Project, Shift, ShiftRoster, GlobalRules, TransactionLog
from datetime import datetime, date, time

def seed_database():
    app = create_app()
    print("🌱 Seeding VolaPlace database...")

    with app.app_context():
        # cascade is active now.
        print("🗑️  Clearing existing data...")
        db.session.query(TransactionLog).delete()
        db.session.query(ShiftRoster).delete()
        db.session.query(Shift).delete()
        db.session.query(Project).delete()
        db.session.query(Organization).delete()
        db.session.query(GlobalRules).delete()
        db.session.query(User).delete()
        db.session.commit()

        # create Global Rules - added updated_by to match the new relationship
        print("📜 Creating global rules...")
        rules = GlobalRules(base_hourly_rate=150.0, bonus_per_beneficiary=12.0)
        db.session.add(rules)

        # Create Users
        print("👥 Creating users...")
        u = {}
        u['admin'] = User(email='admin@volaplace.com', role='admin', phone='254700000001', profile_completed=True)
        u['rc_user'] = User(email='redcross@volaplace.com', role='org_admin', phone='254700000002', profile_completed=True)
        u['fb_user'] = User(email='foodbank@volaplace.com', role='org_admin', phone='254700000003', profile_completed=True)
        u['john'] = User(email='john.doe@volaplace.com', role='volunteer', phone='254711000001', profile_completed=True)
        u['mary'] = User(email='mary.smith@volaplace.com', role='volunteer', phone='254711000002', profile_completed=True)

        for user in u.values():
            user.set_password('Admin123!')
            db.session.add(user)
        db.session.flush() 

        # Create Organizations
        print("🏢 Creating organizations...")
        org_rc = Organization(name='Kenya Red Cross', user_id=u['rc_user'].id, description="Emergency and community health services.")
        org_fb = Organization(name='Nairobi Food Bank', user_id=u['fb_user'].id, description="Fighting hunger in urban areas.")
        db.session.add_all([org_rc, org_fb])
        db.session.flush()

        # Create Projects
        print("📍 Creating projects...")
        p_med = Project(org_id=org_rc.id, name='Medical Camp', lat=-1.26, lon=36.8, address='Westlands', geofence_radius=100)
        p_food = Project(org_id=org_fb.id, name='Food Drive', lat=-1.29, lon=36.7, address='Kawangware', geofence_radius=50)
        db.session.add_all([p_med, p_food])
        db.session.flush()

        # Create Shifts
        print("📅 Creating shifts...")
        s1 = Shift(project_id=p_med.id, title='Morning Clinic Support', date=date.today(), start_time=time(9,0), end_time=time(13,0), status='active', max_volunteers=5)
        s2 = Shift(project_id=p_food.id, title='Packing & Distribution', date=date.today(), start_time=time(10,0), end_time=time(14,0), status='active', max_volunteers=10)
        db.session.add_all([s1, s2])
        db.session.flush()

        # Create Shift Roster
        print("👥 Creating rosters...")
        r1 = ShiftRoster(shift_id=s1.id, volunteer_id=u['john'].id, check_in_time=datetime.now(), status='checked_in')
        db.session.add(r1)
        db.session.flush()

        # Create Transaction
        # Added shift_roster_id to link the payment to the specific shift
        print("💰 Creating transactions...")
        t1 = TransactionLog(volunteer_id=u['john'].id, shift_roster_id=r1.id, amount=600.0, status='completed', phone=u['john'].phone)
        db.session.add(t1)

        db.session.commit()
        print("🚀 Database seeded successfully with relationships!")

if __name__ == "__main__":
    seed_database()