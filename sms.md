Your verification code: {toket it in `KAVENEGAR_VERIFY_TEMPLATE`}

### 3. How It Works

The implementation consists of three main functions:

#### a) **Send OTP** (`issueOtpForPhone`)

- Generates a random 6-digit code (100000-999999)
- Stores hashed code in MongoDB with expiration
- Sends SMS via Kavenegar API
- Returns expiration time

#### b) **Verify OTP** (`verifyOtpForPhone`)

- Checks if code exists and hasn't expired
- Validates code using timing-safe comparison
- Tracks failed attempts (max 5 attempts)
- Deletes code after successful verification

#### c) **Kavenegar SMS Sending** (`sendOtpWithKavenegar`)

- Constructs API URL: `https://api.kavenegar.com/v1/{API_KEY}/verify/lookup.json`
- Sends GET request with parameters:
  - `receptor`: Phone number (e.g., `09123456789`)
  - `token`: OTP code
  - `template`: Template name

## API Endpoints

### Request OTP

**Endpoint**: `POST /api/auth/request-otp`

**Request Body**:
{
"phoneNumber": "09123456789"
}**Response**:
{
"success": true,
"expiresAt": "2024-01-01T12:00:00.000Z"
}**Error Response**:
{
"error": "Phone number is required"
}### Verify OTP (for authentication)
**Endpoint**: `POST /api/auth/verify-otp`

**Request Body**:on
{
"phoneNumber": "09123456789",
"otp": "123456"
}**Response**:
{
"success": true,
"userExists": true,
"user": {
"id": "...",
"name": "...",
"phoneNumber": "09123456789",
"role": "customer"
}
}

## Code Implementation Details

### OTP Service (`src/lib/otp-service.ts`)

The service uses:

- **Crypto library** for secure code generation and hashing
- **HMAC-SHA256** for secure code storage
- **Timing-safe comparison** to prevent timing attacks
- **MongoDB** for storing OTP codes with expiration

### Phone Number Format

- Phone numbers are normalized (Persian/Arabic digits → English)
- Spaces are removed
- Format should be: `09123456789` (Iranian mobile format)

### Security Features

1. **Code Hashing**: OTP codes are hashed before storage (never stored in plain text)
2. **Expiration**: Codes expire after configured TTL (default 120 seconds)
3. **Attempt Limiting**: Maximum 5 failed verification attempts
4. **Timing-Safe Comparison**: Prevents timing attacks during verification

## Usage Example

### Frontend (React/Next.js)

script
// Request OTP
const requestOTP = async (phoneNumber: string) => {
const response = await fetch('/api/auth/request-otp', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ phoneNumber }),
});

const data = await response.json();
if (data.success) {
console.log('OTP sent! Expires at:', data.expiresAt);
}
};

// Verify OTP
const verifyOTP = async (phoneNumber: string, otp: string) => {
const response = await fetch('/api/auth/verify-otp', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ phoneNumber, otp }),
});

const data = await response.json();
if (data.success && data.userExists) {
console.log('Login successful!', data.user);
}
};## Kavenegar API Response Format

**Success Response**:
{
"return": {
"status": 200,
"message": "تایید شد"
},
"entries": [
{
"messageid": 123456,
"message": "تایید شد",
"status": 5,
"statustext": "ارسال شده به مخابرات",
"sender": "10004346",
"receptor": "09123456789",
"date": 1234567890,
"cost": 100
}
]
}**Error Response**:
{
"return": {
"status": 400,
"message": "Invalid phone number"
}
}## Common Issues & Solutions

### 1. "KAVENEGAR_API_KEY environment variable is not set"

**Solution**: Add `KAVENEGAR_API_KEY` to your `.env.local` file

### 2. "Kavenegar rejected OTP request"

**Solutions**:

- Verify your API key is correct
- Check template name matches exactly
- Ensure you have sufficient credits in Kavenegar account
- Verify phone number format is correct (`09xxxxxxxxx`)

### 3. SMS not received

**Solutions**:

- Check spam folder
- Verify phone number format
- Check Kavenegar dashboard for delivery status
- Ensure template is approved in Kavenegar panel

### 4. Template not found

**Solution**: Create the template in Kavenegar panel and ensure `KAVENEGAR_VERIFY_TEMPLATE` matches exactly

## Testing

For testing purposes, you can use Kavenegar's test mode or check the console logs for the generated OTP code (if logged during development).

**Note**: In production, never log OTP codes. They should only be sent via SMS.

## Cost Considerations

- Check Kavenegar pricing: [kavenegar.com/pricing](https://kavenegar.com/pricing)
- Each OTP SMS costs approximately 100-200 tomans per message
- Consider rate limiting to prevent abuse

## Best Practices

1. ✅ Store OTP codes securely (hashed, not plain text)
2. ✅ Set reasonable expiration times (2-5 minutes)
3. ✅ Limit verification attempts (max 5 attempts)
4. ✅ Normalize phone numbers before processing
5. ✅ Use HTTPS in production
6. ✅ Implement rate limiting on OTP requests
7. ✅ Never expose API keys in client-side code
8. ✅ Monitor failed attempts for suspicious activity

## Additional Resources

- [Kavenegar API Documentation](https://kavenegar.com/rest.html)
- [Kavenegar Verify API](https://kavenegar.com/rest.html#section-verify)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
