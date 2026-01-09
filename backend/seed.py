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

        print("📅 Creating shifts...")
        # Shift 1: Completed yesterday
        s1 = Shift(project_id=p_med.id, title='Clinic Day 1', date=date.today() - timedelta(days=1), 
                   start_time=time(9,0), end_time=time(12,0), status='completed', max_volunteers=5)
        # Shift 2: Completed today (Needs payment calculation)
        s2 = Shift(project_id=p_food.id, title='Afternoon Packing', date=date.today(), 
                   start_time=time(13,0), end_time=time(15,0), status='completed', max_volunteers=10)
        db.session.add_all([s1, s2])
        db.session.flush()

        print("👥 Creating rosters and transactions...")
        
        # SCENARIO A: John worked s1, and was ALREADY PAID.
        # 3 hours * 150 + 10 beneficiaries * 12 = 450 + 120 = 570
        r1 = ShiftRoster(shift_id=s1.id, volunteer_id=u['john'].id, status='completed', beneficiaries_served=10)
        db.session.add(r1)
        db.session.flush()
        t1 = TransactionLog(volunteer_id=u['john'].id, shift_roster_id=r1.id, amount=570.0, status='completed', phone=u['john'].phone)
        db.session.add(t1)

        # SCENARIO B: Mary worked s2, shift is completed, but NO TRANSACTION YET.
        # 2 hours * 150 + 5 beneficiaries * 12 = 300 + 60 = 360 (Projected Cost)
        r2 = ShiftRoster(shift_id=s2.id, volunteer_id=u['mary'].id, status='completed', beneficiaries_served=5)
        db.session.add(r2)

        # SCENARIO C: John worked s2 as well, but served 0 beneficiaries.
        # 2 hours * 150 = 300 (Projected Cost)
        r3 = ShiftRoster(shift_id=s2.id, volunteer_id=u['john'].id, status='completed', beneficiaries_served=0)
        db.session.add(r3)

        db.session.commit()
        print("🚀 Database seeded with complex financial scenarios!")

if __name__ == "__main__":
    seed_database()