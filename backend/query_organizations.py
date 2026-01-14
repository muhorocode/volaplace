#!/usr/bin/env python3
"""
Query organizations and their associated user emails from the database.
Works with both local and Render (production) databases.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def get_organizations():
    """Fetch all organizations with their user email/username details."""
    
    # Get DATABASE_URL from environment or prompt
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        print("DATABASE_URL environment variable not set.")
        print("Please set it to your Render database URL or local database URL.")
        return
    
    # Handle postgres:// vs postgresql:// (Render compatibility)
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    try:
        # Create database connection
        engine = create_engine(database_url)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Query organizations with their associated user details
        query = text("""
            SELECT 
                o.id as org_id,
                o.name as org_name,
                o.description,
                o.created_at as org_created_at,
                u.id as user_id,
                u.name as user_name,
                u.email as user_email,
                u.phone,
                u.role,
                u.profile_completed,
                u.created_at as user_created_at
            FROM organizations o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        """)
        
        result = session.execute(query)
        organizations = result.fetchall()
        
        if not organizations:
            print("\n✗ No organizations found in the database.")
            return
        
        print(f"\n{'='*80}")
        print(f"ORGANIZATIONS IN DATABASE ({len(organizations)} total)")
        print(f"{'='*80}\n")
        
        for idx, org in enumerate(organizations, 1):
            print(f"[{idx}] Organization: {org.org_name}")
            print(f"    ├─ Org ID: {org.org_id}")
            print(f"    ├─ Description: {org.description or 'N/A'}")
            print(f"    ├─ Created: {org.org_created_at}")
            print(f"    ├─ User ID: {org.user_id}")
            print(f"    ├─ User Name: {org.user_name}")
            print(f"    ├─ User Email: {org.user_email}")
            print(f"    ├─ Phone: {org.phone}")
            print(f"    ├─ Role: {org.role}")
            print(f"    ├─ Profile Completed: {org.profile_completed}")
            print(f"    └─ User Created: {org.user_created_at}")
            print()
        
        # Summary
        print(f"{'='*80}")
        print(f"SUMMARY:")
        print(f"  Total Organizations: {len(organizations)}")
        
        # Extract unique emails
        emails = [org.user_email for org in organizations]
        print(f"\n  Organization Emails:")
        for email in emails:
            print(f"    • {email}")
        
        print(f"{'='*80}\n")
        
        session.close()
        
    except Exception as e:
        print(f"\n✗ Error connecting to database: {e}")
        print(f"\nPlease ensure:")
        print(f"  1. DATABASE_URL is correctly set")
        print(f"  2. You have network access to the database")
        print(f"  3. Database credentials are valid")
        sys.exit(1)

if __name__ == "__main__":
    get_organizations()
