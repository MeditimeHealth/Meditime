import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET - Fetch affiliate profile
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('id');
    const affiliateCode = searchParams.get('affiliateCode');

    if (!affiliateId && !affiliateCode) {
      return NextResponse.json(
        { error: "Affiliate ID or code is required" },
        { status: 400 }
      );
    }

    // Find affiliate
    const query = affiliateId 
      ? { _id: affiliateId, userType: 'affiliate' }
      : { affiliateCode: affiliateCode?.toUpperCase(), userType: 'affiliate' };
    
    const affiliate = await User.findOne(query).select('-password');

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    const affiliateData = {
      id: affiliate._id,
      name: affiliate.fullName,
      fullName: affiliate.fullName,
      email: affiliate.email,
      phoneNumber: affiliate.phoneNumber,
      affiliateCode: affiliate.affiliateCode,
      isActive: affiliate.isActive,
      walletBalance: affiliate.walletBalance || 0,
      totalEarned: affiliate.totalEarned || 0,
      totalWithdrawn: affiliate.totalWithdrawn || 0,
      pendingCommissions: affiliate.pendingCommissions || 0,
      referrals: affiliate.referrals || 0,
      earnings: affiliate.earnings || 0,
      paymentMethod: affiliate.paymentMethod,
      paymentDetails: affiliate.paymentDetails,
      photo: affiliate.photo,
      createdAt: affiliate.createdAt,
    };

    return NextResponse.json({ affiliate: affiliateData });
  } catch (error: any) {
    console.error("Error fetching affiliate profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update affiliate profile
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      affiliateId, 
      affiliateCode,
      fullName, 
      email, 
      phoneNumber, 
      currentPassword,
      newPassword,
      paymentMethod,
      paymentDetails,
      photo
    } = body;

    if (!affiliateId && !affiliateCode) {
      return NextResponse.json(
        { error: "Affiliate ID or code is required" },
        { status: 400 }
      );
    }

    // Find affiliate
    const query = affiliateId 
      ? { _id: affiliateId, userType: 'affiliate' }
      : { affiliateCode: affiliateCode?.toUpperCase(), userType: 'affiliate' };
    
    const affiliate = await User.findOne(query);

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already in use
    if (email && email.toLowerCase() !== affiliate.email) {
      const existingEmail = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: affiliate._id }
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "This email is already in use" },
          { status: 400 }
        );
      }
    }

    // Check if phone number is being changed and if it's already in use
    if (phoneNumber && phoneNumber !== affiliate.phoneNumber) {
      const existingPhone = await User.findOne({ 
        phoneNumber,
        _id: { $ne: affiliate._id }
      });
      if (existingPhone) {
        return NextResponse.json(
          { error: "This phone number is already in use" },
          { status: 400 }
        );
      }
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password" },
          { status: 400 }
        );
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, affiliate.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      affiliate.password = await bcrypt.hash(newPassword, 10);
    }

    // Update profile fields
    if (fullName) affiliate.fullName = fullName;
    if (email) affiliate.email = email.toLowerCase();
    if (phoneNumber) affiliate.phoneNumber = phoneNumber;
    if (paymentMethod !== undefined) affiliate.paymentMethod = paymentMethod;
    if (paymentDetails !== undefined) affiliate.paymentDetails = paymentDetails;
    if (photo !== undefined) affiliate.photo = photo;

    await affiliate.save();

    // Return updated affiliate data
    const affiliateData = {
      id: affiliate._id,
      name: affiliate.fullName,
      fullName: affiliate.fullName,
      email: affiliate.email,
      phoneNumber: affiliate.phoneNumber,
      affiliateCode: affiliate.affiliateCode,
      isActive: affiliate.isActive,
      walletBalance: affiliate.walletBalance || 0,
      totalEarned: affiliate.totalEarned || 0,
      totalWithdrawn: affiliate.totalWithdrawn || 0,
      pendingCommissions: affiliate.pendingCommissions || 0,
      referrals: affiliate.referrals || 0,
      earnings: affiliate.earnings || 0,
      paymentMethod: affiliate.paymentMethod,
      paymentDetails: affiliate.paymentDetails,
      photo: affiliate.photo,
    };

    return NextResponse.json({ 
      message: "Profile updated successfully",
      affiliate: affiliateData 
    });
  } catch (error: any) {
    console.error("Error updating affiliate profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

