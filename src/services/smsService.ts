import * as SMS from 'expo-sms';

export async function sendSmsToEmergency(service: string, phoneNumber: string) {
  const message = `Road SOS: urgent help needed for ${service}. Please respond immediately.`;
  const isAvailable = await SMS.isAvailableAsync();

  if (isAvailable) {
    await SMS.sendSMSAsync([phoneNumber], message);
    return { success: true };
  }

  console.warn('SMS unavailable, please call manually:', phoneNumber);
  return { success: false };
}
