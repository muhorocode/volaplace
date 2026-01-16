from app import create_app
from app.config import db
from app.models import User, Organization, Project, Shift, ShiftRoster, GlobalRules, TransactionLog
from datetime import datetime, date, time, timedelta

def seed_database():
    app = create_app()
    print("🌱 Seeding VolaPlace database...")

    with app.app_context():
        print("🗑️  Clearing existing data...")
        # Ordering matters for deletion if foreign key constraints are strict
        db.session.query(TransactionLog).delete()
        db.session.query(ShiftRoster).delete()
        db.session.query(Shift).delete()
        db.session.query(Project).delete()
        db.session.query(Organization).delete()
        db.session.query(GlobalRules).delete()
        db.session.query(User).delete()
        db.session.commit()

        print("📜 Creating global rules...")
        # $150/hr and $12 per beneficiary
        rules = GlobalRules(base_hourly_rate=150.0, bonus_per_beneficiary=12.0)
        db.session.add(rules)

        print("👥 Creating users...")
        u = {
            'admin': User(name='Administrator', email='admin@volaplace.com', role='admin', phone='254700000001', profile_completed=True),
            'rc_user': User(name='Red Cross Admin', email='redcross@volaplace.com', role='org_admin', phone='254700000002', profile_completed=True),
            'fb_user': User(name='Food Bank Admin', email='foodbank@volaplace.com', role='org_admin', phone='254700000003', profile_completed=True),
            'john': User(name='John Doe', email='john.doe@volaplace.com', role='volunteer', phone='254711000001', mpesa_phone='254711000001', profile_completed=True),
            'mary': User(name='Mary Smith', email='mary.smith@volaplace.com', role='volunteer', phone='254711000002', mpesa_phone='254711000002', profile_completed=True)
        }
        for user in u.values():
            user.set_password('Admin123!')
            db.session.add(user)
        db.session.flush()

        print("🏢 Creating organizations...")
        org_rc = Organization(name='Kenya Red Cross', user_id=u['rc_user'].id)
        org_fb = Organization(name='Nairobi Food Bank', user_id=u['fb_user'].id)
        db.session.add_all([org_rc, org_fb])
        db.session.flush()

        print("📍 Creating projects...")
        p_med = Project(org_id=org_rc.id, name='Medical Camp', lat=-1.26, lon=36.8, address='Westlands')
        p_food = Project(org_id=org_fb.id, name='Food Drive', lat=-1.29, lon=36.7, address='Kawangware')
        db.session.add_all([p_med, p_food])
        db.session.flush()

        print("📅 Shifts will be created by organizations through the UI...")
        # Note: Removed hardcoded shifts - organizations will create their own shifts

        print("✅ Database seeded with users, organizations, and projects!")
        print("🔐 Login credentials:")
        print("   Admin: admin@volaplace.com / Admin123!")
        print("   Red Cross: redcross@volaplace.com / Admin123!")
        print("   Food Bank: foodbank@volaplace.com / Admin123!")
        print("   Volunteer John: john.doe@volaplace.com / Admin123!")
        print("   Volunteer Mary: mary.smith@volaplace.com / Admin123!")

        db.session.commit()

if __name__ == "__main__":
    seed_database()