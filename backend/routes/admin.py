from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from app.config import db
from app.models import User, GlobalRules, TransactionLog, Organization, Project, Shift

admin_bp = Blueprint('admin', __name__)

def admin_required():
    """Decorator to check if user is admin"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return jsonify({"error": "Admin access required"}), 403
    return None

@admin_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
def get_dashboard_analytics():
    """Get platform-wide analytics for admin dashboard"""
    # Check admin permission
    error_response = admin_required()
    if error_response:
        return error_response
    
    # Optimized query for high-level stats
    stats_sql = text("""
        SELECT 
            (SELECT COALESCE(SUM(amount), 0) FROM transaction_log WHERE status = 'completed') as paid,
            (SELECT COALESCE(SUM(amount), 0) FROM transaction_log WHERE status = 'pending') as pending,
            (SELECT COALESCE(SUM(beneficiaries_served), 0) FROM shifts_roster) as beneficiaries,
            (SELECT COUNT(*) FROM organizations) as total_orgs,
            (SELECT COUNT(*) FROM projects) as total_projects,
            (SELECT COUNT(*) FROM shifts WHERE date >= CURRENT_DATE) as active_shifts,
            (SELECT COUNT(*) FROM users WHERE role = 'volunteer') as total_volunteers
    """)
    
    try:
        result = db.session.execute(stats_sql).fetchone()
        
        return jsonify({
            "summary": {
                "total_paid_out": float(result[0]),
                "total_pending_payout": float(result[1]),
                "total_beneficiaries": int(result[2]),
                "total_organizations": int(result[3]),
                "total_projects": int(result[4]),
                "active_shifts": int(result[5]),
                "total_volunteers": int(result[6])
            },
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/global-rules', methods=['GET'])
@jwt_required()
def get_global_rules():
    """Get current global payout rules"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    rules = GlobalRules.query.first()
    if not rules:
        # Create default rules if none exist
        rules = GlobalRules(base_hourly_rate=100.0, bonus_per_beneficiary=10.0)
        db.session.add(rules)
        db.session.commit()
    
    return jsonify({
        "rules": {
            "id": rules.id,
            "base_hourly_rate": rules.base_hourly_rate,
            "bonus_per_beneficiary": rules.bonus_per_beneficiary
        }
    }), 200

@admin_bp.route('/global-rules', methods=['PUT'])
@jwt_required()
def update_global_rules():
    """Update global payout rules (admin only)"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    base_hourly_rate = data.get('base_hourly_rate')
    bonus_per_beneficiary = data.get('bonus_per_beneficiary')
    
    if base_hourly_rate is None or bonus_per_beneficiary is None:
        return jsonify({"error": "Both base_hourly_rate and bonus_per_beneficiary are required"}), 400
    
    try:
        base_hourly_rate = float(base_hourly_rate)
        bonus_per_beneficiary = float(bonus_per_beneficiary)
        
        if base_hourly_rate < 0 or bonus_per_beneficiary < 0:
            return jsonify({"error": "Rates must be positive numbers"}), 400
    except ValueError:
        return jsonify({"error": "Invalid number format"}), 400
    
    rules = GlobalRules.query.first()
    if not rules:
        rules = GlobalRules()
        db.session.add(rules)
    
    rules.base_hourly_rate = base_hourly_rate
    rules.bonus_per_beneficiary = bonus_per_beneficiary
    rules.updated_by = user_id
    
    db.session.commit()
    
    return jsonify({
        "message": "Global rules updated successfully",
        "rules": {
            "base_hourly_rate": rules.base_hourly_rate,
            "bonus_per_beneficiary": rules.bonus_per_beneficiary
        }
    }), 200

@admin_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_all_transactions():
    """Get all payment transactions for reconciliation"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    status = request.args.get('status')  # Optional filter
    
    query = TransactionLog.query.order_by(TransactionLog.id.desc())
    
    if status:
        query = query.filter_by(status=status)
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    transactions = [{
        "id": t.id,
        "volunteer_id": t.volunteer_id,
        "volunteer_name": t.volunteer.name if t.volunteer else "Unknown",
        "amount": float(t.amount),
        "status": t.status,
        "phone": t.phone
    } for t in pagination.items]
    
    return jsonify({
        "transactions": transactions,
        "pagination": {
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }
    }), 200