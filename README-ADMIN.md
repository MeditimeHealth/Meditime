# Creating Admin User

There are two ways to create an admin user with static credentials:

## Method 1: Using API Endpoint (Recommended)

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Make a POST request to create the admin user:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-admin
   ```

   Or use any API client like Postman, or visit the endpoint in your browser (though POST won't work directly from browser).

## Method 2: Using Node.js Script

1. Make sure you have `dotenv` installed (optional, but recommended):
   ```bash
   npm install dotenv
   ```

2. Run the script:
   ```bash
   npm run create-admin
   ```

## Static Admin Credentials

The admin user will be created with these static credentials:

- **Phone Number:** `admin123`
- **Password:** `admin123`
- **Email:** `admin@meditime.com`
- **Full Name:** Admin User
- **Role:** admin

## Login

After creating the admin user, you can log in using:
- Phone Number: `admin123`
- Password: `admin123`

Or

- Email: `admin@meditime.com`
- Password: `admin123`

## Note

The script will check if an admin user already exists before creating a new one. If an admin already exists, it will display the existing admin's credentials.

