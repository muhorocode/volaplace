from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from app.config import db
from app.models import User, GlobalRules, TransactionLog, Organization, Project, Shift

admin_bp = Blueprint('admin', __name__)

def admin_required():
    """Decorator to check if user is admin"""
    try:
        user_id = int(get_jwt_identity())  # Convert string to int
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return None
    except Exception as e:
        return jsonify({"error": f"Authentication error: {str(e)}"}), 422

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
    user_id = int(get_jwt_identity())  # Convert string to int
    
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


@admin_bp.route('/pending-payments', methods=['GET'])
@jwt_required()
def get_pending_payments():
    """Get all pending payment approvals"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    from app.models import ShiftRoster, Shift
    
    # Get all shift roster entries with pending_payment status
    pending = ShiftRoster.query.filter_by(
        status='pending_payment',
        is_paid=False
    ).all()
    
    payments = []
    for entry in pending:
        volunteer = User.query.get(entry.volunteer_id)
        shift = Shift.query.get(entry.shift_id)
        
        if volunteer and shift:
            payments.append({
                'id': entry.id,
                'volunteer_id': volunteer.id,
                'volunteer_name': volunteer.name,
                'volunteer_phone': volunteer.phone,
                'shift_id': shift.id,
                'shift_title': shift.title,
                'check_in_time': entry.check_in_time.isoformat() if entry.check_in_time else None,
                'check_out_time': entry.check_out_time.isoformat() if entry.check_out_time else None,
                'beneficiaries_served': entry.beneficiaries_served,
                'payout_amount': entry.payout_amount,
                'shift_funded_amount': shift.funded_amount if hasattr(shift, 'funded_amount') else 0
            })
    
    return jsonify({
        'pending_payments': payments,
        'total': len(payments)
    }), 200


@admin_bp.route('/approve-payment/<int:roster_id>', methods=['POST'])
@jwt_required()
def approve_payment(roster_id):
    """Approve a pending payment"""
    error_response = admin_required()
    if error_response:
        return error_response
    
    from app.models import ShiftRoster, Shift, TransactionLog
    from datetime import datetime
    
    roster_entry = ShiftRoster.query.get(roster_id)
    if not roster_entry:
        return jsonify({'error': 'Roster entry not found'}), 404
    
    if roster_entry.status != 'pending_payment':
        return jsonify({'error': 'Payment not in pending status'}), 400
    
    if roster_entry.is_paid:
        return jsonify({'error': 'Payment already processed'}), 400
    
    shift = Shift.query.get(roster_entry.shift_id)
    volunteer = User.query.get(roster_entry.volunteer_id)
    
    if not shift or not volunteer:
        return jsonify({'error': 'Shift or volunteer not found'}), 404
    
    # Check if shift has sufficient funding
    is_funded = getattr(shift, 'is_funded', False)
    funded_amount = getattr(shift, 'funded_amount', 0) or 0
    payout_amount = roster_entry.payout_amount or 0
    
    if not is_funded or funded_amount < payout_amount:
        return jsonify({
            'error': f'Insufficient funds. Shift has KES {funded_amount}, needs KES {payout_amount}'
        }), 400
    
    # Process payment
    shift.funded_amount = funded_amount - payout_amount
    if shift.funded_amount <= 0:
        shift.is_funded = False
    
    roster_entry.is_paid = True
    roster_entry.paid_at = datetime.utcnow()
    roster_entry.status = 'completed'
    
    # Create transaction log
    transaction = TransactionLog(
        volunteer_id=volunteer.id,
        shift_roster_id=roster_entry.id,
        amount=payout_amount,
        status='completed',
        phone=volunteer.phone or 'N/A'
    )
    db.session.add(transaction)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Payment approved successfully',
        'volunteer_name': volunteer.name,
        'amount_paid': payout_amount,
        'shift_remaining_budget': shift.funded_amount
    }), 200
