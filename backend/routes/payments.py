"""
Payments routes for VolaPlace - M-Pesa integration
Refactored: Organization Top-Up Model

Flow:
1. Organization Admin funds shifts via STK Push (money INTO the platform)
2. Volunteers checkout and receive payment from funded shifts (simulated transfer)
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import TransactionLog, ShiftRoster, Shift, User, GlobalRules, Organization, Project
from utils.mpesa import mpesa
from datetime import datetime

bp = Blueprint('payments', __name__)


# ============================================
# ORGANIZATION FUNDING ENDPOINTS
# ============================================

@bp.route('/fund-shift', methods=['POST'])
@jwt_required()
def fund_shift():
    """
    Organization Admin funds a shift via M-Pesa STK Push.
    The admin's phone receives the STK push to deposit money into the shift budget.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Only org_admin or admin can fund shifts
    if user.role not in ['org_admin', 'admin']:
        return jsonify({'error': 'Only organization admins can fund shifts'}), 403
    
    data = request.get_json()
    shift_id = data.get('shift_id')
    amount = data.get('amount')
    
    if not shift_id or not amount:
        return jsonify({'error': 'shift_id and amount are required'}), 400
    
    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid amount'}), 400
    
    # Get the shift
    shift = Shift.query.get(shift_id)
    if not shift:
        return jsonify({'error': 'Shift not found'}), 404
    
    # Verify the org admin owns this shift's project
    project = Project.query.get(shift.project_id)
    org = Organization.query.get(project.org_id)
    
    if user.role == 'org_admin' and org.user_id != user_id:
        return jsonify({'error': 'You can only fund shifts for your own organization'}), 403
    
    # Get admin's phone for STK Push
    phone = user.mpesa_phone or user.phone
    if not phone:
        return jsonify({'error': 'No phone number configured for M-Pesa'}), 400
    
    # Initiate M-Pesa STK Push to the ADMIN (not volunteer!)
    result = mpesa.stk_push(
        phone_number=phone,
        amount=int(amount),
        account_reference=f"FUND-SHIFT-{shift_id}",
        transaction_desc=f"Fund shift: {shift.title}"
    )
    
    if result['success']:
        # Store pending transaction - will be confirmed via callback
        # For now, we'll simulate immediate success for demo purposes
        shift.funded_amount = (shift.funded_amount or 0) + amount
        shift.is_funded = True
        shift.funding_transaction_id = result.get('checkout_request_id', f"DEMO-{datetime.utcnow().timestamp()}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Funding initiated successfully! Check your phone for M-Pesa prompt.',
            'shift_id': shift_id,
            'amount': amount,
            'total_funded': shift.funded_amount,
            'checkout_request_id': result.get('checkout_request_id'),
            'phone': phone
        }), 200
    else:
        return jsonify({
            'error': 'Failed to initiate funding',
            'details': result.get('error')
        }), 500


@bp.route('/fund-shift-demo', methods=['POST'])
@jwt_required()
def fund_shift_demo():
    """
    Demo endpoint to fund a shift without actual M-Pesa (for testing).
    Simulates successful funding.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role not in ['org_admin', 'admin']:
        return jsonify({'error': 'Only organization admins can fund shifts'}), 403
    
    data = request.get_json()
    shift_id = data.get('shift_id')
    amount = data.get('amount', 5000)  # Default 5000 KES for demo
    
    if not shift_id:
        return jsonify({'error': 'shift_id is required'}), 400
    
    shift = Shift.query.get(shift_id)
    if not shift:
        return jsonify({'error': 'Shift not found'}), 404
    
    # Verify ownership
    project = Project.query.get(shift.project_id)
    org = Organization.query.get(project.org_id)
    
    if user.role == 'org_admin' and org.user_id != user_id:
        return jsonify({'error': 'You can only fund shifts for your own organization'}), 403
    
    # Simulate funding
    shift.funded_amount = (shift.funded_amount or 0) + float(amount)
    shift.is_funded = True
    shift.funding_transaction_id = f"DEMO-{datetime.utcnow().timestamp()}"
    
    db.session.commit()
    
    return jsonify({
        'message': 'Shift funded successfully (Demo Mode)',
        'shift_id': shift_id,
        'amount_added': amount,
        'total_funded': shift.funded_amount,
        'is_funded': shift.is_funded
    }), 200


# ============================================
# VOLUNTEER PAYOUT ENDPOINTS
# ============================================

@bp.route('/checkout-complete', methods=['POST'])
@jwt_required()
def checkout_complete():
    """
    Process volunteer checkout and payment.
    NO STK Push here - payment comes from pre-funded shift budget.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role != 'volunteer':
        return jsonify({'error': 'Only volunteers can checkout'}), 403
    
    data = request.get_json()
    shift_id = data.get('shift_id')
    beneficiaries_served = data.get('beneficiaries_served', 0)
    
    if not shift_id:
        return jsonify({'error': 'shift_id is required'}), 400
    
    # Find roster entry
    roster = ShiftRoster.query.filter_by(
        shift_id=shift_id,
        volunteer_id=user_id
    ).first()
    
    if not roster:
        return jsonify({'error': 'You are not registered for this shift'}), 404
    
    if not roster.check_in_time:
        return jsonify({'error': 'You must check in before checking out'}), 400
    
    if roster.check_out_time:
        return jsonify({'error': 'Already checked out'}), 400
    
    # Get the shift
    shift = Shift.query.get(shift_id)
    
    # Check if shift is funded
    if not shift.is_funded or (shift.funded_amount or 0) <= 0:
        return jsonify({
            'error': 'This shift has not been funded yet. Please contact the organization.',
            'is_funded': False
        }), 400
    
    # Calculate payment
    roster.check_out_time = datetime.utcnow()
    roster.beneficiaries_served = beneficiaries_served
    
    time_diff = roster.check_out_time - roster.check_in_time
    hours_worked = time_diff.total_seconds() / 3600
    
    rules = GlobalRules.query.first()
    base_rate = rules.base_hourly_rate if rules else 100.0
    bonus_per_beneficiary = rules.bonus_per_beneficiary if rules else 10.0
    
    base_payment = hours_worked * base_rate
    beneficiary_bonus = beneficiaries_served * bonus_per_beneficiary
    total_amount = round(base_payment + beneficiary_bonus, 2)
    
    # Check if shift has enough funds
    if total_amount > shift.funded_amount:
        # Pay what's available
        total_amount = shift.funded_amount
    
    # Process payment (simulated - deduct from shift budget)
    roster.payout_amount = total_amount
    roster.is_paid = True
    roster.paid_at = datetime.utcnow()
    roster.status = 'completed'
    
    # Deduct from shift budget
    shift.funded_amount = (shift.funded_amount or 0) - total_amount
    if shift.funded_amount <= 0:
        shift.is_funded = False
    
    # Create transaction log
    transaction = TransactionLog(
        volunteer_id=user_id,
        shift_roster_id=roster.id,
        amount=total_amount,
        status='completed',
        phone=user.mpesa_phone or user.phone or 'N/A'
    )
    db.session.add(transaction)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Checkout successful! Payment processed from organization funds.',
        'payment': {
            'hours_worked': round(hours_worked, 2),
            'beneficiaries_served': beneficiaries_served,
            'base_payment': round(base_payment, 2),
            'bonus': round(beneficiary_bonus, 2),
            'total_amount': total_amount,
            'status': 'completed'
        },
        'shift_remaining_budget': shift.funded_amount
    }), 200


@bp.route('/calculate', methods=['POST'])
@jwt_required()
def calculate_payment():
    """
    Calculate estimated payment for a shift (preview before checkout)
    """
    user_id = int(get_jwt_identity())
    
    data = request.get_json()
    shift_id = data.get('shift_id')
    hours = data.get('hours', 0)
    beneficiaries = data.get('beneficiaries', 0)
    
    # Get payment rules
    rules = GlobalRules.query.first()
    base_rate = rules.base_hourly_rate if rules else 100.0
    bonus_per_beneficiary = rules.bonus_per_beneficiary if rules else 10.0
    
    base_payment = float(hours) * base_rate
    beneficiary_bonus = int(beneficiaries) * bonus_per_beneficiary
    total_amount = base_payment + beneficiary_bonus
    
    # Check shift funding status if shift_id provided
    is_funded = False
    funded_amount = 0
    if shift_id:
        shift = Shift.query.get(shift_id)
        if shift:
            is_funded = shift.is_funded
            funded_amount = shift.funded_amount or 0
    
    return jsonify({
        'hours': float(hours),
        'hourly_rate': base_rate,
        'base_payment': round(base_payment, 2),
        'beneficiaries': int(beneficiaries),
        'bonus_per_beneficiary': bonus_per_beneficiary,
        'beneficiary_bonus': round(beneficiary_bonus, 2),
        'total_amount': round(total_amount, 2),
        'shift_is_funded': is_funded,
        'shift_budget': round(funded_amount, 2)
    }), 200


# ============================================
# M-PESA CALLBACK
# ============================================

@bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    Handle M-Pesa callback after STK Push (for shift funding)
    """
    data = request.get_json()
    
    print("M-Pesa Callback Received:", data)
    
    result = data.get('Body', {}).get('stkCallback', {})
    result_code = result.get('ResultCode')
    checkout_request_id = result.get('CheckoutRequestID')
    
    if result_code == 0:
        # Payment successful - find and update the shift
        print(f"✅ Funding successful: {checkout_request_id}")
        
        # Find shift by funding_transaction_id
        shift = Shift.query.filter_by(funding_transaction_id=checkout_request_id).first()
        if shift:
            shift.is_funded = True
            db.session.commit()
            print(f"✅ Shift {shift.id} marked as funded")
    else:
        # Payment failed
        result_desc = result.get('ResultDesc')
        print(f"❌ Funding failed: {result_desc}")
    
    return jsonify({'message': 'Callback received'}), 200


# ============================================
# ADMIN/REPORTING ENDPOINTS
# ============================================

@bp.route('/shift/<int:shift_id>/status', methods=['GET'])
@jwt_required()
def get_shift_funding_status(shift_id):
    """
    Get funding status for a specific shift
    """
    shift = Shift.query.get(shift_id)
    if not shift:
        return jsonify({'error': 'Shift not found'}), 404
    
    # Calculate total payouts for this shift
    total_payouts = db.session.query(db.func.sum(ShiftRoster.payout_amount))\
        .filter(ShiftRoster.shift_id == shift_id, ShiftRoster.is_paid == True)\
        .scalar() or 0
    
    return jsonify({
        'shift_id': shift_id,
        'title': shift.title,
        'is_funded': shift.is_funded,
        'funded_amount': shift.funded_amount or 0,
        'total_payouts': round(total_payouts, 2),
        'remaining_budget': round((shift.funded_amount or 0), 2)
    }), 200


@bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_payments():
    """
    Get pending/completed payments for current user
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role == 'volunteer':
        # Get volunteer's payments
        rosters = ShiftRoster.query.filter_by(volunteer_id=user_id).all()
        
        return jsonify({
            'payments': [{
                'shift_id': r.shift_id,
                'shift_title': r.shift.title if r.shift else 'Unknown',
                'amount': r.payout_amount,
                'is_paid': r.is_paid,
                'paid_at': r.paid_at.isoformat() if r.paid_at else None,
                'status': r.status
            } for r in rosters if r.payout_amount and r.payout_amount > 0]
        }), 200
    
    elif user.role == 'org_admin':
        # Get organization's funded shifts
        org = Organization.query.filter_by(user_id=user_id).first()
        if not org:
            return jsonify({'error': 'Organization not found'}), 404
        
        project_ids = [p.id for p in org.projects]
        shifts = Shift.query.filter(Shift.project_id.in_(project_ids)).all()
        
        return jsonify({
            'shifts': [{
                'id': s.id,
                'title': s.title,
                'is_funded': s.is_funded,
                'funded_amount': s.funded_amount or 0,
                'date': s.date.isoformat() if s.date else None
            } for s in shifts]
        }), 200
    
    return jsonify({'error': 'Invalid role'}), 403


# Legacy endpoint - redirect to new flow
@bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment_legacy():
    """
    Legacy endpoint - now redirects to checkout-complete
    """
    return jsonify({
        'error': 'This endpoint is deprecated. Payments are now processed automatically on checkout from organization funds.',
        'new_endpoint': '/api/payments/checkout-complete'
    }), 400
