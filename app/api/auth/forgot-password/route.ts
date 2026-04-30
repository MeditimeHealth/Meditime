import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTP } from "@/lib/email";
import bcrypt from "bcryptjs";

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { action, email, otp, newPassword } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    // ----------------------------------------------------
    // ACTION: SEND OTP
    // ----------------------------------------------------
    if (action === "send_otp") {
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Return 200 even if user not found to prevent email enumeration attacks
        return NextResponse.json({ message: "If an account exists, an OTP has been sent." }, { status: 200 });
      }

      const otpCode = generateOTP();
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      
      // Save OTP and expiration (10 minutes)
      user.resetOtp = hashedOtp;
      user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send Email
      const emailResult = await sendOTP(user.email!, otpCode, user.fullName);
      
      if (!emailResult.success) {
        console.error("Failed to send OTP email", emailResult.error);
        return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 });
      }

      return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });
    }

    // ----------------------------------------------------
    // ACTION: VERIFY OTP
    // ----------------------------------------------------
    if (action === "verify_otp") {
      if (!email || !otp) {
        return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.resetOtp || !user.resetOtpExpiry) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Check if expired
      if (new Date() > user.resetOtpExpiry) {
        // Clear expired OTP
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
        await user.save();
        return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
      }

      // Verify OTP
      const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
      if (!isOtpValid) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
    }

    // ----------------------------------------------------
    // ACTION: RESET PASSWORD
    // ----------------------------------------------------
    if (action === "reset_password") {
      if (!email || !otp || !newPassword) {
        return NextResponse.json({ error: "Email, OTP, and new password are required" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.resetOtp || !user.resetOtpExpiry) {
        return NextResponse.json({ error: "Invalid session" }, { status: 400 });
      }

      // Check if expired
      if (new Date() > user.resetOtpExpiry) {
        return NextResponse.json({ error: "Session expired. Please request a new OTP." }, { status: 400 });
      }

      // Verify OTP one last time before resetting
      const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
      if (!isOtpValid) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      // Hash new password and save
      user.password = await bcrypt.hash(newPassword, 10);
      
      // Clear OTP fields
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      await user.save();

      return NextResponse.json({ message: "Password reset successfully!" }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Forgot Password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
