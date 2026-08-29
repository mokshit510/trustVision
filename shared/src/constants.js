export const DEMO_PRESETS = [
  {
    id: 'demo-text-bank',
    modality: 'text',
    title: 'Fake Bank KYC SMS',
    subtitle: 'Urgent account block threat requiring link click',
    inputContent: 'Your bank account will be blocked within 30 minutes. Complete KYC using this link immediately: http://bank-kyc-verify-update.com/login'
  },
  {
    id: 'demo-voice-otp',
    modality: 'voice',
    title: 'OTP Extraction Call',
    subtitle: 'Impersonation asking for one-time password over call',
    inputContent: "Hello, I'm calling from your bank security department. We noticed an unauthorized login attempt on your account. To stop the transfer, tell me the 6-digit OTP you just received on your mobile number right now."
  },
  {
    id: 'demo-image-prize',
    modality: 'image',
    title: 'Lottery ₹25,000 Win Banner',
    subtitle: 'Screenshot claiming win requiring advance processing fee',
    inputContent: 'Congratulations! You won ₹25,000. Pay ₹499 processing fee to claim your prize immediately via UPI ID: prize-claim@upi'
  },
  {
    id: 'demo-qr-parking',
    modality: 'image',
    title: 'Malicious QR Notice',
    subtitle: 'Counterfeit parking payment QR replacing official meter',
    inputContent: 'PARKING PAYMENT: Scan QR to pay parking fee: http://quick-pay-parking-meters.online/qr?spot=4921'
  },
  {
    id: 'demo-text-delivery',
    modality: 'text',
    title: 'Suspicious Package SMS',
    subtitle: 'Unscheduled delivery notification requesting address fee',
    inputContent: 'Your parcel could not be delivered due to an incorrect postal address. Pay ₹25 redelivery fee to update address: http://indiapost-parcel-tracking.xyz/update'
  }
];

export const FORBIDDEN_CERTAINTY_PHRASES = [
  'definitely a scam',
  '100% a scam',
  'guaranteed fraud',
  'is certainly malicious',
  'without a doubt a scam',
  'this is a scam for sure'
];

export const SAFE_REPLACEMENT_PHRASES = [
  'appears potentially dangerous because',
  'exhibits strong indicators of potential fraud because',
  'shows characteristics commonly associated with suspicious requests because'
];
