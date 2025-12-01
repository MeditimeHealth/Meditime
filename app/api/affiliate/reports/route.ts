import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import AffiliateCommission from '@/models/AffiliateCommission';
import AffiliateWithdrawal from '@/models/AffiliateWithdrawal';

// GET - Fetch comprehensive reports for an affiliate
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('affiliateCode');
    const reportType = searchParams.get('type') || 'all'; // all, monthly, daily, pending, paid
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const date = searchParams.get('date'); // For daily report

    if (!affiliateCode) {
      return NextResponse.json(
        { error: 'Affiliate code is required' },
        { status: 400 }
      );
    }

    // Find affiliate by code
    const { default: Affiliate } = await import('@/models/Affiliate');
    const affiliate = await Affiliate.findOne({ affiliateCode: affiliateCode.toUpperCase() });
    
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    const affiliateId = affiliate._id;

    // Base query for appointments with this affiliate code
    const baseAppointmentQuery: any = {
      $or: [
        { affiliateId: affiliateId },
        { affiliateCode: affiliateCode.toUpperCase() }
      ]
    };

    // Base query for commissions
    const baseCommissionQuery: any = {
      affiliateId: affiliateId
    };

    let startDate: Date | null = null;
    let endDate: Date | null = null;

    // Calculate date ranges based on report type
    if (reportType === 'monthly' && month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    } else if (reportType === 'daily' && date) {
      const selectedDate = new Date(date);
      startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
    }

    if (startDate && endDate) {
      baseAppointmentQuery.createdAt = { $gte: startDate, $lte: endDate };
      baseCommissionQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Get affiliate code submissions count (appointments with this affiliate code)
    const affiliateCodeSubmissions = await Appointment.countDocuments(baseAppointmentQuery);

    // Get all commissions
    const allCommissions = await AffiliateCommission.find(baseCommissionQuery)
      .populate('appointmentId', 'patientName appointmentDate serialNumber')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalPaid = allCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    const totalUnpaid = allCommissions
      .filter(c => c.status === 'pending' || c.status === 'approved')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    const totalPending = allCommissions
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    const totalApproved = allCommissions
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    // Monthly breakdown
    const monthlyBreakdown = allCommissions.reduce((acc: any, commission) => {
      const date = new Date(commission.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
          totalCommissions: 0,
          paid: 0,
          unpaid: 0,
          pending: 0,
          approved: 0,
          count: 0
        };
      }
      
      acc[monthKey].totalCommissions += commission.commissionAmount;
      acc[monthKey].count += 1;
      
      if (commission.status === 'paid') {
        acc[monthKey].paid += commission.commissionAmount;
      } else if (commission.status === 'approved') {
        acc[monthKey].approved += commission.commissionAmount;
        acc[monthKey].unpaid += commission.commissionAmount;
      } else if (commission.status === 'pending') {
        acc[monthKey].pending += commission.commissionAmount;
        acc[monthKey].unpaid += commission.commissionAmount;
      }
      
      return acc;
    }, {});

    // Daily breakdown (last 30 days)
    const dailyBreakdown: any[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCommissions = allCommissions.filter(c => {
        const cDate = new Date(c.createdAt);
        return cDate >= date && cDate < nextDate;
      });

      const dayAppointments = await Appointment.countDocuments({
        ...baseAppointmentQuery,
        createdAt: { $gte: date, $lt: nextDate }
      });

      dailyBreakdown.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        commissions: dayCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
        paid: dayCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0),
        unpaid: dayCommissions.filter(c => c.status !== 'paid').reduce((sum, c) => sum + c.commissionAmount, 0),
        pending: dayCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0),
        count: dayCommissions.length,
        appointments: dayAppointments
      });
    }

    // Pending commissions
    const pendingCommissions = allCommissions
      .filter(c => c.status === 'pending')
      .map(c => ({
        _id: c._id,
        commissionAmount: c.commissionAmount,
        totalBill: c.totalBill,
        createdAt: c.createdAt,
        appointmentId: c.appointmentId,
        status: c.status
      }));

    // Paid commissions
    const paidCommissions = allCommissions
      .filter(c => c.status === 'paid')
      .map(c => ({
        _id: c._id,
        commissionAmount: c.commissionAmount,
        totalBill: c.totalBill,
        createdAt: c.createdAt,
        paidAt: c.paidAt,
        appointmentId: c.appointmentId,
        status: c.status
      }));

    // Unpaid commissions (pending + approved)
    const unpaidCommissions = allCommissions
      .filter(c => c.status === 'pending' || c.status === 'approved')
      .map(c => ({
        _id: c._id,
        commissionAmount: c.commissionAmount,
        totalBill: c.totalBill,
        createdAt: c.createdAt,
        appointmentId: c.appointmentId,
        status: c.status
      }));

    return NextResponse.json({
      affiliateCode: affiliateCode.toUpperCase(),
      affiliateId: affiliateId.toString(),
      summary: {
        totalAffiliateCodeSubmissions: affiliateCodeSubmissions,
        totalCommissions: allCommissions.length,
        totalPaid,
        totalUnpaid,
        totalPending,
        totalApproved,
        totalEarned: totalPaid + totalApproved
      },
      monthlyBreakdown: Object.values(monthlyBreakdown),
      dailyBreakdown,
      pendingCommissions,
      paidCommissions,
      unpaidCommissions,
      allCommissions: allCommissions.map(c => ({
        _id: c._id,
        commissionAmount: c.commissionAmount,
        totalBill: c.totalBill,
        status: c.status,
        createdAt: c.createdAt,
        paidAt: c.paidAt,
        approvedAt: c.approvedAt,
        appointmentId: c.appointmentId
      })),
      period: startDate && endDate ? { startDate, endDate } : null
    });
  } catch (error: any) {
    console.error('Error fetching affiliate reports:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
