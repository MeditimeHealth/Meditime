import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Membership from "@/models/Membership";
import { initiateSSLCommerzPayment } from "@/lib/sslcommerz";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { membershipId } = body;

    if (!membershipId) {
      return NextResponse.json(
        { error: "Membership ID is required" },
        { status: 400 }
      );
    }

    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    if (membership.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Payment already completed" },
        { status: 400 }
      );
    }

    // Prepare SSLCommerz payment data
    const paymentData = {
      total_amount: membership.totalAmount,
      currency: "BDT",
      tran_id: `MEMBERSHIP_${membership._id}_${Date.now()}`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership/payment/success`,
      fail_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership/payment/fail`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/membership/payment/cancel`,
      ipn_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/memberships/payment/ipn`,
      product_name: `${membership.cardPackage.charAt(0).toUpperCase() + membership.cardPackage.slice(1)} Membership Card`,
      product_category: "Membership",
      product_profile: "general",
      cus_name: membership.name,
      cus_email: "customer@meditime.com", // You might want to add email to membership
      cus_phone: membership.mobileNumber,
      cus_add1: membership.deliveryAddress,
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      shipping_method: "YES",
      num_of_item: 1,
      value_a: membershipId, // Pass membership ID for reference
    };

    const paymentResponse = await initiateSSLCommerzPayment(paymentData);

    if (paymentResponse.status === "SUCCESS") {
      // Update membership with transaction ID
      membership.transactionId = paymentData.tran_id;
      await membership.save();

      return NextResponse.json({
        success: true,
        gatewayUrl: paymentResponse.GatewayPageURL,
        transactionId: paymentData.tran_id,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to initiate payment" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
