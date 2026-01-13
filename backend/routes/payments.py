"""
Payments routes for VolaPlace - M-Pesa integration
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import TransactionLog, ShiftRoster, User, GlobalRules
from utils.mpesa import mpesa

bp = Blueprint('payments', __name__)

@bp.route('/calculate', methods=['POST'])
@jwt_required()
def calculate_payment():
    """
    Calculate payment for a completed shift
    """
    user_id = get_jwt_identity()
    
    data = request.get_json()
    shift_roster_id = data.get('shift_roster_id')
    
    if not shift_roster_id:
        return jsonify({'error': 'shift_roster_id required'}), 400
    
    # Get roster entry
    roster = ShiftRoster.query.get(shift_roster_id)
    if not roster:
        return jsonify({'error': 'Shift roster not found'}), 404
    
    # Check if completed
    if roster.status != 'completed':
        return jsonify({'error': 'Shift not completed yet'}), 400
    
    # Get payment rules
    rules = GlobalRules.query.first()
    if not rules:
        # Default rules
        base_rate = 100.0
        bonus_per_beneficiary = 10.0
    else:
        base_rate = rules.base_hourly_rate
        bonus_per_beneficiary = rules.bonus_per_beneficiary
    
    # Calculate hours worked
    if not roster.check_in_time or not roster.check_out_time:
        return jsonify({'error': 'Missing check-in or check-out time'}), 400
    
    time_diff = roster.check_out_time - roster.check_in_time
    hours_worked = time_diff.total_seconds() / 3600
    
    # Calculate payment
    base_payment = hours_worked * base_rate
    beneficiary_bonus = roster.beneficiaries_served * bonus_per_beneficiary
    total_amount = base_payment + beneficiary_bonus
    
    return jsonify({
        'hours_worked': round(hours_worked, 2),
        'hourly_rate': base_rate,
        'base_payment': round(base_payment, 2),
        'beneficiaries_served': roster.beneficiaries_served,
        'bonus_per_beneficiary': bonus_per_beneficiary,
        'beneficiary_bonus': round(beneficiary_bonus, 2),
        'total_amount': round(total_amount, 2)
    }), 200

@bp.route('/initiate', methods=['POST'])
@jwt_required()
def initiate_payment():
    """
    Initiate M-Pesa STK Push payment
    """
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    data = request.get_json()
    shift_roster_id = data.get('shift_roster_id')
    
    if not shift_roster_id:
        return jsonify({'error': 'shift_roster_id required'}), 400
    
    # Get roster entry
    roster = ShiftRoster.query.get(shift_roster_id)
    if not roster:
        return jsonify({'error': 'Shift roster not found'}), 404
    
    # Verify ownership
    if roster.volunteer_id != user_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Check if completed
    if roster.status != 'completed':
        return jsonify({'error': 'Shift not completed yet'}), 400
    
    # Check if payment already exists
    existing_payment = TransactionLog.query.filter_by(shift_roster_id=shift_roster_id).first()
    if existing_payment and existing_payment.status == 'completed':
        return jsonify({'error': 'Payment already processed'}), 400
    
    # Calculate payment (reuse calculation logic)
    rules = GlobalRules.query.first()
    base_rate = rules.base_hourly_rate if rules else 100.0
    bonus_per_beneficiary = rules.bonus_per_beneficiary if rules else 10.0
    
    time_diff = roster.check_out_time - roster.check_in_time
    hours_worked = time_diff.total_seconds() / 3600
    base_payment = hours_worked * base_rate
    beneficiary_bonus = roster.beneficiaries_served * bonus_per_beneficiary
    total_amount = base_payment + beneficiary_bonus
    
    # Get volunteer phone
    volunteer = User.query.get(roster.volunteer_id)
    phone = volunteer.mpesa_phone or volunteer.phone
    
    # Initiate M-Pesa payment
    result = mpesa.stk_push(
        phone_number=phone,
        amount=int(total_amount),
        account_reference=f"SHIFT-{shift_roster_id}",
        transaction_desc=f"Payment for shift work"
    )
    
    if result['success']:
        # Create transaction log
        transaction = TransactionLog(
            volunteer_id=roster.volunteer_id,
            shift_roster_id=shift_roster_id,
            amount=total_amount,
            status='pending',
            phone=phone
        )
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Payment initiated successfully',
            'amount': round(total_amount, 2),
            'phone': phone,
            'checkout_request_id': result['checkout_request_id'],
            'transaction_id': transaction.id
        }), 200
    else:
        return jsonify({
            'error': 'Failed to initiate payment',
            'details': result.get('error')
        }), 500

@bp.route('/mpesa/callback', methods=['POST'])
def mpesa_callback():
    """
    Handle M-Pesa callback after STK Push
    """
    data = request.get_json()
    
    # Log the callback
    print("M-Pesa Callback:", data)
    
    # Extract result
    result = data.get('Body', {}).get('stkCallback', {})
    result_code = result.get('ResultCode')
    checkout_request_id = result.get('CheckoutRequestID')
    
    if result_code == 0:
        # Payment successful
        # Find transaction by checkout_request_id (you'd need to store this)
        # For now, just log success
        print(f"Payment successful: {checkout_request_id}")
        
        # Update transaction status
        # transaction = TransactionLog.query.filter_by(checkout_request_id=checkout_request_id).first()
        # if transaction:
        #     transaction.status = 'completed'
        #     db.session.commit()
        
        return jsonify({'message': 'Callback received'}), 200
    else:
        # Payment failed
        result_desc = result.get('ResultDesc')
        print(f"Payment failed: {result_desc}")
        
        return jsonify({'message': 'Callback received'}), 200

@bp.route('/pending', methods=['GET'])
@jwt_required()
def get_pending_payments():
    """
    Get pending payments for current user
    """
    user_id = get_jwt_identity()
    
    # Get pending transactions
    transactions = TransactionLog.query.filter_by(
        volunteer_id=user_id,
        status='pending'
    ).all()
    
    return jsonify({
        'count': len(transactions),
        'transactions': [
            {
                'id': t.id,
                'amount': t.amount,
                'status': t.status,
                'shift_roster_id': t.shift_roster_id
            } for t in transactions
        ]
    }), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_payment_history():
    """
    Get payment history for current user
    """
    user_id = get_jwt_identity()
    
    # Get all transactions
    transactions = TransactionLog.query.filter_by(volunteer_id=user_id).all()
    
    return jsonify({
        'total_earned': sum(t.amount for t in transactions if t.status == 'completed'),
        'pending': sum(t.amount for t in transactions if t.status == 'pending'),
        'transactions': [
            {
                'id': t.id,
                'amount': t.amount,
                'status': t.status,
                'shift_roster_id': t.shift_roster_id
            } for t in transactions
        ]
    }), 200

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "payments routes are working!"}), 200
