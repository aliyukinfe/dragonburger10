// Telebirr Payment Integration for DragonBurger
// This handles Ethiopian mobile money payments through Telebirr API

interface TelebirrPaymentRequest {
  amount: number
  orderId: string
  customerPhone: string
  customerName: string
  description?: string
}

interface TelebirrPaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  message: string
  errorCode?: string
}

interface TelebirrCallbackData {
  transactionId: string
  orderId: string
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED'
  amount: number
  paymentTime: string
  signature: string
}

// Telebirr API configuration
const TELEBIRR_CONFIG = {
  appId: process.env.NEXT_PUBLIC_TELEBIRR_APP_ID || '',
  appKey: process.env.NEXT_PUBLIC_TELEBIRR_APP_KEY || '',
  baseUrl: process.env.NEXT_PUBLIC_TELEBIRR_BASE_URL || 'https://api.telebirr.com',
  callbackUrl: process.env.NEXT_PUBLIC_TELEBIRR_CALLBACK_URL || '',
  returnUrl: process.env.NEXT_PUBLIC_TELEBIRR_RETURN_URL || ''
}

/**
 * Generate signature for Telebirr API requests
 */
function generateSignature(data: any): string {
  // Uses Telebirr's signature algorithm with simple hash
  const sortedKeys = Object.keys(data).sort()
  const stringToSign = sortedKeys.map(key => `${key}=${data[key]}`).join('&')
  
  // This should be replaced with actual Telebirr signature generation
  return btoa(stringToSign)
}

/**
 * Initiate Telebirr payment
 */
export async function initiateTelebirrPayment(paymentData: TelebirrPaymentRequest): Promise<TelebirrPaymentResponse> {
  try {
    // Prepare payment data
    const paymentPayload = {
      appId: TELEBIRR_CONFIG.appId,
      appKey: TELEBIRR_CONFIG.appKey,
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      customerPhone: paymentData.customerPhone,
      customerName: paymentData.customerName,
      description: paymentData.description || `DragonBurger Order #${paymentData.orderId}`,
      callbackUrl: TELEBIRR_CONFIG.callbackUrl,
      returnUrl: TELEBIRR_CONFIG.returnUrl,
      timestamp: Date.now().toString()
    }

    // Generate signature
    const signature = generateSignature(paymentPayload)
    ;(paymentPayload as any).signature = signature

    // Make API call to Telebirr
    const response = await fetch(`${TELEBIRR_CONFIG.baseUrl}/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload)
    })

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        transactionId: result.transactionId,
        paymentUrl: result.paymentUrl,
        message: 'Payment initiated successfully'
      }
    } else {
      return {
        success: false,
        message: result.message || 'Failed to initiate payment',
        errorCode: result.errorCode
      }
    }

  } catch (error) {
    console.error('Telebirr payment error:', error)
    return {
      success: false,
      message: 'Payment service unavailable'
    }
  }
}

/**
 * Verify Telebirr payment callback
 */
export function verifyTelebirrCallback(callbackData: TelebirrCallbackData): boolean {
  try {
    // Verify signature
    const expectedSignature = generateSignature({
      transactionId: callbackData.transactionId,
      orderId: callbackData.orderId,
      status: callbackData.status,
      amount: callbackData.amount,
      paymentTime: callbackData.paymentTime
    })

    return callbackData.signature === expectedSignature
  } catch (error) {
    console.error('Callback verification error:', error)
    return false
  }
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(transactionId: string): Promise<TelebirrPaymentResponse> {
  try {
    const payload = {
      appId: TELEBIRR_CONFIG.appId,
      appKey: TELEBIRR_CONFIG.appKey,
      transactionId
    }

    const signature = generateSignature(payload)
    ;(payload as any).signature = signature

    const response = await fetch(`${TELEBIRR_CONFIG.baseUrl}/payment/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (result.success) {
      return {
        success: true,
        transactionId: result.transactionId,
        message: result.status === 'SUCCESS' ? 'Payment successful' : 'Payment pending'
      }
    } else {
      return {
        success: false,
        message: result.message || 'Failed to check payment status',
        errorCode: result.errorCode
      }
    }

  } catch (error) {
    console.error('Payment status check error:', error)
    return {
      success: false,
      message: 'Unable to check payment status'
    }
  }
}

/**
 * Format phone number for Telebirr
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Ensure Ethiopian country code
  if (cleaned.startsWith('251')) {
    return cleaned
  } else if (cleaned.startsWith('0')) {
    return '251' + cleaned.substring(1)
  } else if (cleaned.length === 9) {
    return '251' + cleaned
  }
  
  return cleaned
}

/**
 * Get Telebirr payment URL for redirect
 */
export function getTelebirrPaymentUrl(paymentUrl: string): string {
  return paymentUrl || `${TELEBIRR_CONFIG.baseUrl}/payment`
}

/**
 * Handle Telebirr webhook callback
 */
export async function handleTelebirrWebhook(callbackData: any): Promise<{ success: boolean; message: string }> {
  try {
    // Verify the callback signature
    if (!verifyTelebirrCallback(callbackData)) {
      return {
        success: false,
        message: 'Invalid callback signature'
      }
    }

    // Update payment status in database
    const { supabase } = await import('./supabase')
    const supabaseClient = (supabase as any).supabase
    
    const { error } = await supabaseClient
      .from('payments')
      .update({
        status: callbackData.status === 'SUCCESS' ? 'completed' : 'failed',
        payment_response: callbackData
      })
      .eq('transaction_id', callbackData.transactionId)

    if (error) {
      console.error('Database update error:', error)
      return {
        success: false,
        message: 'Failed to update payment status'
      }
    }

    // Update order status if payment was successful
    if (callbackData.status === 'SUCCESS') {
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('order_id')
        .eq('transaction_id', callbackData.transactionId)
        .single()

      if (payment) {
        await supabaseClient
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', payment.order_id)
      }
    }

    return {
      success: true,
      message: 'Callback processed successfully'
    }

  } catch (error) {
    console.error('Webhook handling error:', error)
    return {
      success: false,
      message: 'Webhook processing failed'
    }
  }
}
