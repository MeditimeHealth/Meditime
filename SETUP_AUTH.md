# Authentication Setup Guide

## Prerequisites

1. **MongoDB Setup**
   - Create a MongoDB database (local or MongoDB Atlas)
   - Get your connection string

2. **Environment Variables**
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/meditime
   ```
   Or for MongoDB Atlas:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditime?retryWrites=true&w=majority
   ```

3. **Background Image**
   - Add a background image for the auth pages to `/public/auth-bg.jpg`
   - Recommended size: 1920x1080 or larger
   - The image should be scenic/medical themed

## Pages Created

### Login Page (`/login`)
- Phone number or email login
- Password with show/hide toggle
- Forgot password link
- Sign in with Google button (UI only)
- Link to signup page

### Signup Page (`/signup`)
Fields included:
- **Email** (Optional)
- **Phone Number** (Required)
- **Full Name** (Required)
- **Gender** (Required: Male, Female, Other)
- **Blood Group** (Optional)
- **Age** (Required)
- **Password** (Required, with show/hide toggle)
- **Confirm Password** (Required, with show/hide toggle)
- **Terms and Conditions** checkbox (Required)

## Features

- ✅ Glassmorphism design with frosted glass effect
- ✅ Responsive two-column layout
- ✅ Form validation with Zod
- ✅ MongoDB integration
- ✅ Password hashing with bcrypt
- ✅ Show/hide password toggles
- ✅ Primary color (#009A98) theming
- ✅ shadcn/ui components

## API Routes

### POST `/api/auth/signup`
- Creates a new user account
- Validates all fields
- Hashes password before storing
- Returns user data (without password)

### POST `/api/auth/login`
- Authenticates user by phone/email
- Verifies password
- Returns user data (without password)

## Usage

1. Navigate to `/login` or `/signup`
2. Fill in the required fields
3. Submit the form
4. On successful signup, redirects to login page
5. On successful login, redirects to home page

## Notes

- Phone numbers must be unique
- Passwords are hashed using bcrypt (10 rounds)
- User model includes timestamps (createdAt, updatedAt)
- All form fields are validated both client and server side
