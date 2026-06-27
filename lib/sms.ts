export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, ''); // Keep only digits
  if (cleaned.startsWith('880')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return '880' + cleaned;
}

export async function sendSMS(to: string, message: string): Promise<{ success: boolean; code?: string; error?: string }> {
  try {
    const formattedNumber = formatPhoneNumber(to);
    
    // Validate number length (must be 13 digits: 8801XXXXXXXXX)
    if (formattedNumber.length !== 13) {
      return { success: false, error: 'Invalid phone number format. Must be 11 digits starting with 01.' };
    }

    const apiKey = process.env.SMS_API_KEY || 'DCd1V24JIqZWnpeLLCXI';
    const senderId = process.env.SMS_SENDER_ID || '8809604902867';

    // BulkSMSBD API endpoint
    const url = 'http://bulksmsbd.net/api/smsapi';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        senderid: senderId,
        number: formattedNumber,
        message: message,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Failed to parse SMS gateway response:', text);
      return { success: false, error: `Invalid response from SMS gateway: ${text}` };
    }

    console.log('SMS Gateway response:', data);

    // 202 is the success code for bulksmsbd.net
    if (data.response_code === 202 || data.response_code === '202') {
      return { success: true, code: '202' };
    } else {
      return { success: false, code: data.response_code?.toString(), error: data.success_message || 'SMS send failed' };
    }
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message || 'Failed to send SMS' };
  }
}
