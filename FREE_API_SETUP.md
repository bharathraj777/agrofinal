# 🆓 Free API Setup Guide - Complete Step-by-Step Instructions

This guide will help you set up all the FREE API services needed for the Smart Agriculture Support System. All services have generous free tiers perfect for development and small-scale production.

## 📋 Quick Setup Checklist

- [ ] OpenWeatherMap API (Weather data)
- [ ] OpenCage Geocoder (Location search)
- [ ] Email Service (Choose one)
- [ ] Configuration testing

## 1. Weather Data - OpenWeatherMap ⛅

**Free Tier:** 1,000 calls/day (~30,000/month) - Perfect for development and small production

### Step-by-Step Setup:

1. **Visit OpenWeatherMap**
   - Go to [https://openweathermap.org/api](https://openweathermap.org/api)

2. **Create Free Account**
   - Click "Sign Up" or "Get Free API Key"
   - Fill out the registration form
   - Use a valid email address (you'll need to verify it)

3. **Verify Email**
   - Check your email inbox
   - Click the verification link
   - Your account is now active

4. **Get API Key**
   - Go to your account dashboard
   - Click on "API keys" tab
   - Copy your default API key (looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

5. **Add to Environment**
   ```bash
   # Add to your .env file
   OPENWEATHER_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

### What You Get:
- Current weather data (temperature, humidity, pressure, wind)
- 5-day weather forecasts
- Agricultural insights (season detection, frost/heat warnings)
- Weather alerts for farming

### Time Required: 2-3 minutes

---

## 2. Maps & Geocoding - OpenCage Geocoder 🗺️

**Free Tier:** 2,500 calls/day (~75,000/month) - Excellent for location services

### Step-by-Step Setup:

1. **Visit OpenCage**
   - Go to [https://opencagedata.com/api](https://opencagedata.com/api)

2. **Sign Up for Free**
   - Click "Get API Key"
   - Fill out the free registration form
   - No credit card required

3. **Verify Email**
   - Check your email and verify your account
   - Your API key will be displayed

4. **Get API Key**
   - Copy the API key from your dashboard
   - Key format: `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`

5. **Add to Environment**
   ```bash
   # Add to your .env file
   OPENCAGE_API_KEY=a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
   MAP_PROVIDER=opencage
   ```

### Alternative: OpenStreetMap (No API Key Required)
```bash
MAP_PROVIDER=leaflet
```
- Works immediately without registration
- Unlimited usage
- Perfect for development

### Time Required: 3-4 minutes

---

## 3. Email Service - Choose One Option 📧

### Option A: EmailJS (Recommended - Easiest)

**Free Tier:** 200 emails/month - Perfect for small applications

#### Setup Steps:

1. **Visit EmailJS**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)

2. **Create Free Account**
   - Click "Sign Up for Free"
   - Fill out the registration form
   - Verify your email

3. **Add Email Service**
   - Go to "Email Services" → "Add New Service"
   - Choose "Gmail" (recommended)
   - Connect your Gmail account
   - Authorize EmailJS to send emails on your behalf

4. **Create Email Template**
   - Go to "Email Templates" → "Create New Template"
   - Give it a name (e.g., "Welcome Email")
   - Use variables like `{{to_email}}`, `{{subject}}`, `{{message}}`
   - Save the template

5. **Get Your Credentials**
   - Go to "Account" → "Public Key"
   - Copy your Public Key, Service ID, and Template ID

6. **Add to Environment**
   ```bash
   EMAILJS_PUBLIC_KEY=your_public_key_here
   EMAILJS_SERVICE_ID=your_service_id_here
   EMAILJS_TEMPLATE_ID=your_template_id_here
   ```

### Time Required: 5-7 minutes

---

### Option B: SendGrid (More Professional)

**Free Tier:** 100 emails/day (~3,000/month)

#### Setup Steps:

1. **Visit SendGrid**
   - Go to [https://sendgrid.com/](https://sendgrid.com/)

2. **Create Free Account**
   - Click "Start for Free"
   - Fill out the registration form
   - Phone verification required

3. **Verify Sender Identity**
   - Go to "Settings" → "Sender Authentication"
   - Choose "Domain Authentication" or "Single Sender Verification"
   - Follow the verification steps

4. **Generate API Key**
   - Go to "Settings" → "API Keys"
   - Create API Key with "Mail Send" permissions
   - Copy the API key immediately (won't be shown again)

5. **Add to Environment**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxx.yyyyyy.zzzzzz
   ```

### Time Required: 10-15 minutes

---

### Option C: Gmail SMTP (Completely Free)

**Free Tier:** Limited by Gmail sending limits (500 emails/day)

#### Setup Steps:

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Security → 2-Step Verification
   - Enable 2FA on your Gmail account

2. **Generate App Password**
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Generate a 16-character app password

3. **Add to Environment**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_character_app_password
   ```

### Time Required: 5 minutes

---

## 4. Complete Configuration Example 📝

Here's a complete `.env` file with all FREE services:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/agriculture_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters

# FREE API Keys
OPENWEATHER_API_KEY=your_openweather_key
OPENCAGE_API_KEY=your_opencage_key
MAP_PROVIDER=opencage

# Email Service (choose one - EmailJS example)
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id

# Application Settings
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
EMAIL_FROM=noreply@agriculture-app.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 5. Testing Your Setup ✅

### Test Weather API
```bash
# Test OpenWeatherMap
curl "https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY&units=metric"
```

### Test Geocoding API
```bash
# Test OpenCage
curl "https://api.opencagedata.com/geocode/v1/json?q=Mumbai&key=YOUR_API_KEY"
```

### Test Email Service
Start the application and check the console for email configuration status.

---

## 6. Cost Summary 💰

| Service | Cost | Daily Limit | Monthly Limit |
|---------|------|-------------|--------------|
| OpenWeatherMap | **FREE** | 1,000 calls | ~30,000 calls |
| OpenCage Geocoder | **FREE** | 2,500 calls | ~75,000 calls |
| EmailJS | **FREE** | ~7 emails/day | 200 emails/month |
| SendGrid | **FREE** | 100 emails/day | 3,000 emails/month |
| OpenStreetMap | **FREE** | Unlimited | Unlimited |
| Agmarknet Data | **FREE** | Unlimited | Unlimited |

**Total Monthly Cost: $0** 🎉

---

## 7. Development Mode (No API Keys) 🛠️

Want to test without setting up APIs? The application works with simulated data:

```bash
# Skip all API keys and use simulated data
cp .env.example .env
docker-compose up -d
```

**Features with Simulated Data:**
- ✅ Weather data (seasonal averages)
- ✅ Maps display (without geocoding)
- ✅ Email logging to console
- ✅ Static market prices
- ✅ All core functionality

Perfect for:
- Initial development
- Feature testing
- Demonstrations

---

## 8. Troubleshooting 🔧

### Weather API Issues
- **Problem:** Invalid API key error
- **Solution:** Double-check the key, wait 10 minutes after creation

### Geocoding Issues
- **Problem:** Rate limit exceeded
- **Solution:** Switch to OpenStreetMap (leaflet) - no API key needed

### Email Issues
- **Problem:** Authentication failed
- **Solution:** For Gmail, generate a new App Password
- **Alternative:** Switch to EmailJS (easier setup)

### General Issues
- **Problem:** API not working
- **Solution:** Check your internet connection and API key format

---

## 9. Production Considerations 🚀

For production deployment:

1. **Monitor API Usage**
   - Check OpenWeatherMap usage daily
   - Monitor email sending limits
   - Set up alerts for rate limits

2. **Scale Up When Needed**
   - OpenWeatherMap: $40/month for 100,000 calls
   - SendGrid: $15/month for 40,000 emails
   - OpenCage: Free tier usually sufficient

3. **Fallback Systems**
   - Application works without APIs (simulated data)
   - Graceful degradation implemented
   - User notifications for API limitations

---

## 10. Quick Links 🔗

- **OpenWeatherMap:** [openweathermap.org/api](https://openweathermap.org/api)
- **OpenCage:** [opencagedata.com/api](https://opencagedata.com/api)
- **EmailJS:** [emailjs.com](https://www.emailjs.com/)
- **SendGrid:** [sendgrid.com](https://sendgrid.com/)
- **OpenStreetMap:** [openstreetmap.org](https://www.openstreetmap.org/)

---

## 🎉 You're All Set!

Your Smart Agriculture Support System is now configured with completely FREE API services. You have:

- ✅ Real-time weather data and agricultural insights
- ✅ Interactive maps with location search
- ✅ Email notifications and alerts
- ✅ Market price information
- ✅ Government schemes database

**Total Cost: $0/month** with generous usage limits perfect for development and small-scale production!

Happy farming with technology! 🌾