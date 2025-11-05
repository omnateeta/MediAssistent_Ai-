# Google OAuth Setup for MediAssist AI

This guide will help you set up Google Sign-In functionality for the MediAssist AI application.

## Current Status

The application is currently using a temporary authentication system due to database connection issues. Google OAuth will work once you provide valid credentials.

## Setting Up Google OAuth

### Step 1: Get Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable APIs**
   - Navigate to "APIs & Services" > "Library"
   - Search for and enable "Google+ API"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type (for testing)
   - Fill in the required application information:
     - App name: MediAssist AI
     - User support email: your-email@example.com
     - Developer contact information: your-email@example.com
   - Add authorized domains (localhost for development)
   - Save the configuration

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Name: MediAssist AI Web Client
   - Authorized redirect URIs (add all that apply):
     - http://localhost:3000/api/auth/callback/google
     - http://localhost:3001/api/auth/callback/google
     - https://your-production-domain.com/api/auth/callback/google (if applicable)

### Step 2: Update Environment Variables

1. Open the `.env.local` file in your project root
2. Uncomment the Google OAuth lines
3. Replace the placeholder values with your actual credentials:

```env
GOOGLE_CLIENT_ID="your-actual-google-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-google-client-secret-here"
```

**Important**: Do NOT use your Gemini API key as the Google Client Secret. They are completely different credentials.

### Step 3: Restart the Development Server

1. Stop your current development server (Ctrl+C)
2. Start it again with `npm run dev`

### Step 4: Test Google Sign-In

1. Navigate to http://localhost:3000/auth/signin
2. Choose either "Patient" or "Doctor" sign-in
3. Click the "Sign in with Google" button
4. You should be redirected to Google's authentication page

## Troubleshooting

### Common Issues

1. **"Invalid Redirect URI" Error**
   - Make sure all redirect URIs in Google Cloud Console exactly match the ones specified above
   - Include both localhost:3000 and localhost:3001 if you're using different ports

2. **"Invalid Client" Error**
   - Verify that you're using the correct Client ID and Client Secret from Google Cloud Console
   - Make sure you didn't accidentally use the Gemini API key as the Client Secret

3. **"Access Blocked" Error**
   - Check that your OAuth consent screen is properly configured
   - For production, you may need to submit for verification

### Verifying Your Setup

You can verify that your Google OAuth credentials are properly configured by checking the server logs when you start the development server. Look for messages indicating that GoogleProvider is being initialized.

## Security Notes

- Never commit your actual Google OAuth credentials to version control
- The `.env.local` file is included in `.gitignore` to prevent accidental commits
- For production deployments, use proper secret management solutions

## Need Help?

If you continue to have issues with Google OAuth setup:

1. Double-check that your redirect URIs exactly match the ones specified above
2. Verify that your Google Cloud project has the correct APIs enabled
3. Make sure your OAuth consent screen is properly configured
4. Check that you're using the Web application client type, not another type

For additional support, refer to the [NextAuth.js Google Provider documentation](https://next-auth.js.org/providers/google).