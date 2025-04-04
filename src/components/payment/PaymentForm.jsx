import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const PaymentForm = ({ appointmentId, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actualAmount, setActualAmount] = useState(amount);
  
  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await api.payments.createPaymentIntent(appointmentId);
        setClientSecret(response.data.clientSecret);
        
        // If the amount from API is available, use it; otherwise use passed amount
        if (response.data.amount) {
          setActualAmount(response.data.amount);
        }
      } catch (error) {
        setError('Failed to initialize payment. Please try again.');
        console.error('Payment intent error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (appointmentId) {
      createPaymentIntent();
    }
  }, [appointmentId]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    // Complete payment when user submits form
    const cardElement = elements.getElement(CardElement);
    
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Patient Name', // Ideally get this from user context
          },
        }
      });
      
      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await api.payments.confirmPayment(appointmentId, paymentIntent.id);
        onSuccess();
      }
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Payment processing error:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return <div className="py-8 flex justify-center"><LoadingSpinner size="medium" /></div>;
  }
  
  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Payment Details</h3>
        <p className="text-gray-600 mb-4">Amount: ${(actualAmount / 100).toFixed(2)}</p>
        
        <div className="border border-gray-300 rounded-md p-4 bg-white">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
        
        {error && (
          <div className="mt-3 text-red-600 text-sm">{error}</div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
        >
          {processing ? <span className="flex items-center"><LoadingSpinner size="sm" /> Processing...</span> : 'Pay Now'}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;