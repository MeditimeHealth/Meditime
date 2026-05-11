import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import User from '@/models/User';
import LiveConsultant from '@/models/LiveConsultant';
import bcrypt from 'bcryptjs';
import { verifyAdmin } from '@/lib/auth';
import { generateUniqueSlug } from '@/lib/slug';

function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'meditime-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    // 0. Verify Admin Access
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { 
      name,
      nameBn,
      email, 
      phone, 
      password, 
      specialty,
      specialtyBn,
      language,
      consultationFee, 
      autoLiveConsultant,
      estimatedWaitTime,
      maxQueueSize 
    } = body;

    // 1. Validation
    if (!name || !email || !password || consultationFee === undefined) {
      return NextResponse.json(
        { error: 'Name, email, password, and consultation fee are required' }, 
        { status: 400 }
      );
    }

    // 2. Check if user with email or phone already exists
    const userQuery: any[] = [{ email: email.toLowerCase() }];
    if (phone) {
      userQuery.push({ phoneNumber: phone });
    }
    const existingUser = await User.findOne({ $or: userQuery });
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }
      if (phone && existingUser.phoneNumber === phone) {
        return NextResponse.json({ error: 'A user with this phone number already exists' }, { status: 409 });
      }
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create Doctor
    const doctorObj: any = {
      name,
      email: email.toLowerCase(),
      specialty: specialty || '',
      consultationFee: Number(consultationFee) || 500,
      availability: [{ days: ['Monday'], time: '09:00 AM - 05:00 PM', timeBn: 'সকাল ০৯:০০ - বিকাল ০৫:০০' }],
    };
    if (nameBn) doctorObj.nameBn = nameBn;
    if (specialtyBn) doctorObj.specialtyBn = specialtyBn;
    if (phone) doctorObj.phoneNumber = phone;

    // Auto-generate slug from name, fallback to nameBn
    doctorObj.slug = await generateUniqueSlug(name || nameBn || 'doctor', Doctor);
    
    const doctor = await Doctor.create(doctorObj);

    // 5. Create User associated with Doctor
    const userObj: any = {
      fullName: name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'doctor',
      userType: 'doctor',
      doctorId: doctor._id,
      isActive: true,
    };
    if (phone) userObj.phoneNumber = phone;
    
    const user = await User.create(userObj);

    // 6. Optionally create Live Consultant profile
    let liveConsultant = null;
    if (autoLiveConsultant) {
      const roomId = generateRoomId();
      liveConsultant = await LiveConsultant.create({
        doctorId: doctor._id,
        consultationFee: Number(consultationFee) || 500,
        estimatedWaitTime: Number(estimatedWaitTime) || 15,
        maxQueueSize: Number(maxQueueSize) || 10,
        roomId,
        specialization: specialty || '',
        specializationBn: specialtyBn || '',
        language: language || 'Bengali',
        isLive: true, // Start them as live immediately or you can default to false
      });
    }

    return NextResponse.json({ 
      message: 'Doctor account created successfully',
      doctor,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      },
      liveConsultant
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating doctor:", error);
    return NextResponse.json({ error: error.message || 'Failed to create doctor' }, { status: 500 });
  }
}
