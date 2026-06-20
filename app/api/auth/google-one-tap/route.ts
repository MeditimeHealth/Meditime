import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { credential } = body;

    if (!credential) {
      return NextResponse.json(
        { error: "Google credential token is required" },
        { status: 400 }
      );
    }

    // Verify the Google ID token with Google's tokeninfo endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    
    if (!verifyRes.ok) {
      return NextResponse.json(
        { error: "Invalid or expired Google credential token" },
        { status: 400 }
      );
    }

    const payload = await verifyRes.json();

    // Verify audience (Client ID) matches
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      return NextResponse.json(
        { error: "Google client ID mismatch" },
        { status: 400 }
      );
    }

    const email = payload.email?.toLowerCase();
    const name = payload.name;
    const googleId = payload.sub;
    const picture = payload.picture;

    if (!email) {
      return NextResponse.json(
        { error: "Email not provided by Google account" },
        { status: 400 }
      );
    }

    // Find if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Check for conflict: if they registered with credentials (email/password), reject One-Tap login
      if (user.authProvider !== 'google') {
        return NextResponse.json(
          { 
            error: "An account with this email already exists with a password. Please log in using your password.",
            code: "AUTH_PROVIDER_CONFLICT"
          },
          { status: 400 }
        );
      }
      
      // Update Google profile fields if needed (e.g. photo, googleId if missing)
      let needsUpdate = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsUpdate = true;
      }
      if (picture && user.photo !== picture) {
        user.photo = picture;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await user.save();
      }
    } else {
      // Create new user with Google details
      user = await User.create({
        email,
        fullName: name,
        authProvider: 'google',
        googleId,
        photo: picture,
        role: 'user',
        userType: 'user'
      });
    }

    // Prepare user data for client
    const userData = {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      username: user.username || "",
      fullName: user.fullName,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      age: user.age,
      photo: user.photo,
      role: user.role || 'user',
      userType: user.userType || 'user',
      authProvider: user.authProvider,
    };

    // Generate JWT Token (identical logic to credentials login)
    const token = await signToken({
      id: String(user._id),
      email: user.email || '',
      role: user.role || 'user',
      userType: user.userType || 'user'
    });

    const response = NextResponse.json(
      { 
        message: "Login successful via Google", 
        user: userData 
      },
      { status: 200 }
    );

    // Set secure HTTP-Only cookie (identical to credentials login)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 365 days for lifetime session
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error("Google One-Tap verification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
