import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import AffiliateCommission from "@/models/AffiliateCommission";
import User from "@/models/User";
import Affiliate from "@/models/Affiliate";

// GET - Fetch completed appointments with commission data
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Ensure Doctor model is registered
    if (!mongoose.models.Doctor) {
      await import("@/models/Doctor");
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const affiliateFilter = searchParams.get("affiliateFilter"); // 'all', 'affiliate', 'self'
    const doctorId = searchParams.get("doctorId");
    const hospital = searchParams.get("hospital");

    // Build query - only completed appointments
    const query: any = {
      status: "completed",
    };

    // Date filter
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.appointmentDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Affiliate filter
    if (affiliateFilter === "affiliate") {
      query.affiliateCode = { $exists: true, $ne: null };
    } else if (affiliateFilter === "self") {
      query.$or = [
        { affiliateCode: { $exists: false } },
        { affiliateCode: null },
      ];
    }

    // Doctor filter
    if (doctorId) {
      query.doctorId = doctorId;
    }

    // Hospital filter (will be applied after populate)

    // Fetch appointments
    const appointments = await Appointment.find(query)
      .populate({
        path: "doctorId",
        model: Doctor,
        select: "name qualification department hospital image",
      })
      .populate("affiliateId", "name affiliateCode email")
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    // Filter by hospital if specified (before processing)
    let filteredAppointments = appointments;
    if (hospital) {
      filteredAppointments = appointments.filter(
        (app: any) => app.doctorId?.hospital === hospital
      );
    }

    // Get all appointment IDs
    const appointmentIds = filteredAppointments.map((app: any) => app._id);

    // Fetch all commissions at once
    const commissions = await AffiliateCommission.find({
      appointmentId: { $in: appointmentIds },
    }).lean();

    // Create a map for quick lookup
    const commissionMap = new Map();
    commissions.forEach((comm: any) => {
      commissionMap.set(comm.appointmentId.toString(), comm);
    });

    // Get unique affiliate codes
    const affiliateCodes = new Set<string>();
    filteredAppointments.forEach((app: any) => {
      if (app.affiliateCode) {
        affiliateCodes.add(app.affiliateCode.toUpperCase());
      }
    });

    // Fetch all affiliates at once
    const affiliatesByCode = new Map();
    if (affiliateCodes.size > 0) {
      const affiliateCodeArray = Array.from(affiliateCodes);
      const userAffiliates = await User.find({
        affiliateCode: { $in: affiliateCodeArray },
        userType: "affiliate",
      }).lean();
      const legacyAffiliates = await Affiliate.find({
        affiliateCode: { $in: affiliateCodeArray },
      }).lean();

      [...userAffiliates, ...legacyAffiliates].forEach((aff: any) => {
        affiliatesByCode.set(
          aff.affiliateCode.toUpperCase(),
          {
            name: aff.fullName || aff.name,
            code: aff.affiliateCode,
          }
        );
      });
    }

    // Process appointments with commission data
    const appointmentsWithCommission = filteredAppointments.map((appointment: any) => {
      const commission = commissionMap.get(appointment._id.toString());

      // Get affiliate info
      let affiliateInfo = null;
      if (appointment.affiliateId) {
        affiliateInfo = {
          name: appointment.affiliateId.name || appointment.affiliateId.fullName,
          code: appointment.affiliateId.affiliateCode,
        };
      } else if (appointment.affiliateCode) {
        affiliateInfo = affiliatesByCode.get(appointment.affiliateCode.toUpperCase());
      }

      return {
        _id: appointment._id,
        patientName: appointment.patientName,
        mobileNumber: appointment.mobileNumber,
        doctor: appointment.doctorId?.name || "N/A",
        department: appointment.doctorId?.department || "N/A",
        hospital: appointment.doctorId?.hospital || appointment.hospitalName || "N/A",
        affiliateType: appointment.affiliateCode ? "Affiliate" : "Self",
        affiliateCode: appointment.affiliateCode || null,
        affiliateName: affiliateInfo?.name || null,
        appointmentDate: appointment.appointmentDate,
        commissionAmount: commission?.commissionAmount || 0,
        commissionStatus: commission?.status || null,
        serialNumber: appointment.serialNumber,
      };
    });

    // Calculate statistics
    const totalAppointments = appointmentsWithCommission.length;
    const affiliateAppointments = appointmentsWithCommission.filter(
      (app) => app.affiliateType === "Affiliate"
    ).length;
    const selfAppointments = appointmentsWithCommission.filter(
      (app) => app.affiliateType === "Self"
    ).length;
    const totalEarned = appointmentsWithCommission.reduce(
      (sum, app) => sum + (app.commissionAmount || 0),
      0
    );

    // Monthly breakdown
    const monthlyBreakdown: { [key: string]: number } = {};
    appointmentsWithCommission.forEach((app) => {
      const monthKey = new Date(app.appointmentDate).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short" }
      );
      monthlyBreakdown[monthKey] =
        (monthlyBreakdown[monthKey] || 0) + (app.commissionAmount || 0);
    });

    return NextResponse.json({
      appointments: appointmentsWithCommission,
      stats: {
        total: totalAppointments,
        affiliate: affiliateAppointments,
        self: selfAppointments,
        totalEarned,
      },
      monthlyBreakdown,
    });
  } catch (error: any) {
    console.error("Error fetching completed appointments:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
