"""
M-Pesa Integration for VolaPlace
Handles STK Push for volunteer payments
"""
import os
import requests
import base64
from datetime import datetime

class MPesa:
    """M-Pesa Daraja API Integration"""
    
    def __init__(self):
        # Get credentials from environment variables
        self.consumer_key = os.getenv('MPESA_CONSUMER_KEY', '')
        self.consumer_secret = os.getenv('MPESA_CONSUMER_SECRET', '')
        self.business_shortcode = os.getenv('MPESA_SHORTCODE', '174379')
        self.passkey = os.getenv('MPESA_PASSKEY', '')
        self.callback_url = os.getenv('MPESA_CALLBACK_URL', 'https://volaplace-api.onrender.com/api/payments/mpesa/callback')
        
        # API URLs
        self.auth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        self.stk_push_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        
    def get_access_token(self):
        """Get OAuth access token from M-Pesa"""
        try:
            # Create base64 encoded credentials
            credentials = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_credentials}'
            }
            
            response = requests.get(self.auth_url, headers=headers)
            
            if response.status_code != 200:
                print(f"M-Pesa Auth Failed: {response.status_code} - {response.text}")
            
            response.raise_for_status()
            
            result = response.json()
            return result.get('access_token')
            
        except Exception as e:
            print(f"M-Pesa auth error: {str(e)}")
            return None
    
    def generate_password(self):
        """Generate password for STK Push"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        data_to_encode = f"{self.business_shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data_to_encode.encode()).decode()
        return encoded, timestamp
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK Push to customer's phone
        
        Args:
            phone_number (str): Phone number in format 254712345678
            amount (int): Amount to charge
            account_reference (str): Reference for transaction (e.g., shift ID)
            transaction_desc (str): Description of transaction
            
        Returns:
            dict: Response from M-Pesa API
        """
        try:
            # Get access token
            access_token = self.get_access_token()
            if not access_token:
                return {'success': False, 'error': 'Failed to get access token'}
            
            # Generate password and timestamp
            password, timestamp = self.generate_password()
            
            # Format phone number (remove + and spaces)
            phone_number = phone_number.replace('+', '').replace(' ', '').replace('-', '')
            if not phone_number.startswith('254'):
                phone_number = '254' + phone_number.lstrip('0')
            
            # Prepare request
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.business_shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'TransactionType': 'CustomerPayBillOnline',
                'Amount': int(amount),
                'PartyA': phone_number,
                'PartyB': self.business_shortcode,
                'PhoneNumber': phone_number,
                'CallBackURL': self.callback_url,
                'AccountReference': account_reference,
                'TransactionDesc': transaction_desc
            }
            
            # Make request
            response = requests.post(
                self.stk_push_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            result = response.json()
            
            # Check response
            if result.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'checkout_request_id': result.get('CheckoutRequestID'),
                    'merchant_request_id': result.get('MerchantRequestID'),
                    'message': result.get('CustomerMessage', 'STK Push sent successfully')
                }
            else:
                print(f"M-Pesa STK Push failed: {result.get('errorMessage', 'Unknown error')}")
                return {
                    'success': False,
                    'error': result.get('errorMessage', 'STK Push failed'),
                    'error_code': result.get('errorCode', 'N/A')
                }
                
        except requests.exceptions.RequestException as e:
            print(f"M-Pesa request error: {str(e)}")
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }
        except Exception as e:
            print(f"M-Pesa error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def query_transaction(self, checkout_request_id):
        """
        Query the status of an STK Push transaction
        
        Args:
            checkout_request_id (str): CheckoutRequestID from stk_push
            
        Returns:
            dict: Transaction status
        """
        try:
            access_token = self.get_access_token()
            if not access_token:
                return {'success': False, 'error': 'Failed to get access token'}
            
            password, timestamp = self.generate_password()
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                'BusinessShortCode': self.business_shortcode,
                'Password': password,
                'Timestamp': timestamp,
                'CheckoutRequestID': checkout_request_id
            }
            
            query_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
            response = requests.post(query_url, json=payload, headers=headers)
            
            return response.json()
            
        except Exception as e:
            print(f"M-Pesa query error: {str(e)}")
            return {'success': False, 'error': str(e)}


# Singleton instance
mpesa = MPesa()
