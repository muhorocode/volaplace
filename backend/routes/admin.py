from flask import Blueprint, jsonify
from sqlalchemy import text
from app.config import db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/dashboard-stats', methods=['GET'])
def get_dashboard_analytics():
    # optimized query for high-level stats
    stats_sql = text("""
        SELECT 
            (SELECT COALESCE(SUM(amount), 0) FROM transaction_log WHERE status = 'completed') as paid,
            (SELECT COALESCE(SUM(amount), 0) FROM transaction_log WHERE status = 'pending') as pending,
            (SELECT COALESCE(SUM(beneficiaries_served), 0) FROM shifts_roster) as beneficiaries
    """)
    
    try:
        result = db.session.execute(stats_sql).fetchone()
        
        return jsonify({
            "summary": {
                "total_paid_out": result[0],
                "total_pending_payout": result[1],
                "total_beneficiaries": result[2]
            },
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500