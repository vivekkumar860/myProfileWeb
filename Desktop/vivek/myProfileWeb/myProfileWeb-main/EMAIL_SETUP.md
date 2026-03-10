# Email Configuration for Netlify Deployment

This portfolio website uses Netlify Functions with Nodemailer to handle contact form submissions.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email Settings in Netlify

Go to your Netlify dashboard:
1. Navigate to **Site settings** → **Environment variables**
2. Add the following environment variables:

#### For Gmail:
- `EMAIL_USER`: Your Gmail address (e.g., `your-email@gmail.com`)
- `EMAIL_PASS`: Your Gmail App Password (NOT your regular password)

**Important:** You need to generate an App Password for Gmail:
1. Go to [Google Account Settings](https://myaccount.google.com)
2. Navigate to **Security** → **2-Step Verification** (must be enabled)
3. Click on **App passwords** at the bottom
4. Generate a new app password for "Mail"
5. Use this 16-character password as `EMAIL_PASS`

#### Alternative SMTP Services:
You can also use other email services like SendGrid, Mailgun, or your own SMTP server by modifying the transporter configuration in `netlify/functions/send-email.js`.

### 3. Local Testing

For local development:
1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your email credentials
3. Run the development server:
```bash
npm run dev
```

### 4. Deploy to Netlify

Option 1: Deploy via Git
```bash
git add .
git commit -m "Add contact form with Nodemailer"
git push origin main
```

Option 2: Deploy via Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Troubleshooting

### Common Issues:

1. **"Authentication failed"**: Make sure you're using an App Password, not your regular Gmail password
2. **"Less secure app access"**: Use App Passwords instead of enabling less secure apps
3. **Form not working**: Check the browser console and Netlify function logs for errors
4. **CORS errors**: Make sure the netlify.toml file is properly configured

### Testing the Form:
1. Open your deployed site
2. Fill in the contact form
3. Check browser console for any errors
4. Check Netlify function logs: **Netlify Dashboard** → **Functions** → **send-email**

## Security Notes

- Never commit your `.env` file to Git
- Always use environment variables for sensitive data
- The `.gitignore` file is configured to exclude sensitive files
- Consider rate limiting for production use