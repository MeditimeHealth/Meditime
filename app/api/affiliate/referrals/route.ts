import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import User from '@/models/User';
import Affiliate from '@/models/Affiliate';

// GET - Fetch appointments made with a specific affiliate code
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Ensure Doctor model is registered
    if (!mongoose.models.Doctor) {
      // Force model registration by importing
      await import('@/models/Doctor');
    }

    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('affiliateCode');
    const affiliateId = searchParams.get('affiliateId');

    if (!affiliateCode && !affiliateId) {
      return NextResponse.json(
        { error: 'Affiliate code or ID is required' },
        { status: 400 }
      );
    }

    // Build query to find appointments
    const query: any = {};
    
    if (affiliateCode) {
      query.affiliateCode = affiliateCode.toUpperCase();
    }
    
    if (affiliateId) {
      query.affiliateId = affiliateId;
    }

    // Fetch appointments with referral code
    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        model: Doctor,
        select: 'name qualification department hospital image'
      })
      .sort({ appointmentDate: -1, createdAt: -1 });

    // Get summary statistics
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };

    return NextResponse.json(
      { 
        appointments,
        stats,
        message: 'Referral patients fetched successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching referral patients:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
