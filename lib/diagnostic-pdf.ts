import { DiagnosticBookingRecord } from "@/types/diagnostic";

export const generateDiagnosticBookingPDF = async (booking: DiagnosticBookingRecord) => {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    const W = doc.internal.pageSize.getWidth(); // 210
    const H = doc.internal.pageSize.getHeight(); // 297
    const M = 15; // margin

    const bookedTests = booking.tests || [];
    const totalPrice = booking.totalPrice || bookedTests.reduce((a, b) => a + (b.price || 0), 0);
    const selectedVenue = booking.venueId || {};
    
    // Robustly extract the booking ID
    const bookingRef = (booking as any).bookingId || 
                       (booking as any).booking_id || 
                       (booking as any).bookingRef || 
                       (booking as any)._id?.toString().slice(-8).toUpperCase() ||
                       "N/A";
                       
    const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    // ─────── HEADER BAR ───────
    doc.setFillColor(0, 75, 80); // dark teal
    doc.rect(0, 0, W, 37, 'F');
    
    // Add Logo (Top Center)
    try {
      // Create a helper to load image
      const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
      };

      const logoImg = await loadImage('/logo.png').catch(() => null);
      if (logoImg) {
        const logoWidth = 35; 
        const logoHeight = (logoImg.height * logoWidth) / logoImg.width;

        // Draw white background rectangle for logo
        const bgPadding = 2;
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(
          (W - logoWidth) / 2 - bgPadding, 
          7 - bgPadding, 
          logoWidth + bgPadding * 2, 
          logoHeight + bgPadding * 2, 
          2, 2, 'F'
        );

        doc.addImage(logoImg, 'PNG', (W - logoWidth) / 2, 7, logoWidth, logoHeight);
      }
    } catch (e) {
      console.warn("PDF Logo failed to load", e);
    }
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(selectedVenue.name || 'MediTime Diagnostics', M, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Booked via MediTime Portal', M, 31);
    
    // Booking reference (right side)
    doc.setFontSize(7);
    doc.text('BOOKING ID', W - M, 22, { align: 'right' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 184, 0); // Use brand yellow/orange for the ID
    doc.text(bookingRef, W - M, 29, { align: 'right' });

    // ─────── DIVIDER LINE ───────
    let y = 41;
    doc.setDrawColor(0, 75, 80);
    doc.setLineWidth(0.5);
    doc.line(M, y, W - M, y);
    
    // ─────── PATIENT & APPOINTMENT INFO ───────
    y += 8;
    doc.setTextColor(0, 75, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT & APPOINTMENT INFORMATION', M, y);
    
    y += 10;
    const col2 = W / 2 + 5;
    
    // Patient Name
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'normal');
    doc.text('PATIENT NAME', M, y);
    doc.text('PATIENT ID', col2, y);
    
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.patientName || 'N/A', M, y);
    doc.text(`PID-${booking.mobileNumber?.slice(-5) || '00000'}`, col2, y);
    
    y += 10;
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.setFont('helvetica', 'normal');
    doc.text('DATE & TIME', M, y);
    doc.text('HOSPITAL LOCATION', col2, y);
    
    y += 5;
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(appointmentDate, M, y);
    const venueAddr = selectedVenue.address || selectedVenue.name || 'N/A';
    doc.text(venueAddr.length > 35 ? venueAddr.substring(0, 35) + '...' : venueAddr, col2, y);

    // ─────── BOOKED TESTS TABLE ───────
    y += 14;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(M, y, W - M, y);
    
    y += 8;
    doc.setTextColor(0, 75, 80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKED TESTS', M, y);
    
    // Table header
    y += 8;
    doc.setFillColor(245, 245, 245);
    doc.rect(M, y - 4, W - M * 2, 8, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.line(M, y - 4, W - M, y - 4);
    doc.line(M, y + 4, W - M, y + 4);
    
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('Test Name', M + 3, y + 1);
    doc.text('Amount', W - M - 3, y + 1, { align: 'right' });
    
    // Table rows
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    bookedTests.forEach((test: any) => {
      y += 9;
      doc.setTextColor(40, 40, 40);
      const testName = test.name || 'Unnamed Test';
      doc.text(testName.length > 55 ? testName.substring(0, 55) + '...' : testName, M + 3, y);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${test.price || 0} BDT`, W - M - 3, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      
      // Row separator
      y += 3;
      doc.setDrawColor(230, 230, 230);
      doc.line(M, y, W - M, y);
    });

    // ─────── TOTALS ───────
    y += 8;
    const totalsX = 130;
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, y, { align: 'right' });
    doc.setTextColor(40, 40, 40);
    doc.text(`${totalPrice} BDT`, W - M - 3, y, { align: 'right' });
    
    y += 6;
    doc.setTextColor(100, 100, 100);
    doc.text('Platform Fee:', totalsX, y, { align: 'right' });
    doc.setTextColor(40, 40, 40);
    doc.text('0 BDT', W - M - 3, y, { align: 'right' });
    
    y += 6;
    doc.setTextColor(0, 130, 60);
    doc.text('Discount:', totalsX, y, { align: 'right' });
    doc.text('0 BDT', W - M - 3, y, { align: 'right' });
    
    y += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(totalsX + 5, y, W - M, y);
    
    y += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 75, 80);
    doc.text('Total Due:', totalsX, y, { align: 'right' });
    doc.setTextColor(30, 30, 30);
    doc.text(`${totalPrice} BDT`, W - M - 3, y, { align: 'right' });

    // ─────── INSTRUCTIONS ───────
    // Collect unique recommendations from all tests, max 4
    const allRecs: string[] = [];
    bookedTests.forEach((test: any) => {
      if (test.recommendations && Array.isArray(test.recommendations)) {
        test.recommendations.forEach((r: string) => {
          if (!allRecs.includes(r)) {
            allRecs.push(r);
          }
        });
      }
    });
    
    // Show raw recommendation strings only, max 4
    const uniqueRecsForPdf = allRecs.slice(0, 4);

    if (uniqueRecsForPdf.length > 0) {
      y += 14;
      
      // Yellow left border accent
      doc.setFillColor(255, 200, 50);
      doc.rect(M, y - 4, 2.5, 6 + uniqueRecsForPdf.length * 7, 'F');
      
      doc.setTextColor(180, 100, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Pre-Test Instructions', M + 6, y);
      
      y += 7;
      doc.setFontSize(8);
      uniqueRecsForPdf.forEach((rec) => {
        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'normal');
        doc.text(`\u2022  ${rec}`, M + 6, y);
        y += 7;
      });
    }

    // ─────── FOOTER ───────
    const footerY = H - 12;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(M, footerY - 4, W - M, footerY - 4);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a system-generated document. For queries, contact support@meditime.com', W / 2, footerY, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W / 2, footerY + 4, { align: 'center' });

    // Save
    const fileName = `MediTime_Booking_${bookingRef}.pdf`;
    doc.save(fileName);
    
  } catch (err) {
    console.error("PDF generation error:", err);
  }
};
