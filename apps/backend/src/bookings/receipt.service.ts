import { BadRequestException, Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { rentalDays } from './booking-dates';
import { BookingWithRelations } from './bookings.repository';

const GOLD = '#E8A317';
const INK = '#1D1F23';
const MUTED = '#6B7280';
const RULE = '#E5E7EB';

function money(amount: unknown): string {
  const n = Number(amount);
  return `LKR ${n.toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

@Injectable()
export class ReceiptService {
  /** Render a payment receipt PDF. Only paid bookings have receipts. */
  async generate(
    booking: BookingWithRelations,
  ): Promise<{ buffer: Buffer; filename: string }> {
    if (!booking.payment || booking.payment.status !== 'PAID') {
      throw new BadRequestException(
        'A receipt is only available once the booking is paid',
      );
    }
    const payment = booking.payment;

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(22)
      .fillColor(INK)
      .text('VRentNow', left, 50);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text('Premium vehicle rentals · Colombo 03, Sri Lanka', left, 76)
      .text('info@vrentnow.live · +94 71 747 6810', left, 88);

    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(GOLD)
      .text('PAYMENT RECEIPT', left, 50, { width, align: 'right' });
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Receipt no: ${payment.transactionId ?? payment.id}`, left, 72, {
        width,
        align: 'right',
      })
      .text(
        `Issued: ${dateOnly(payment.paidAt ?? booking.updatedAt)}`,
        left,
        84,
        { width, align: 'right' },
      );

    doc
      .moveTo(left, 110)
      .lineTo(right, 110)
      .lineWidth(2)
      .strokeColor(GOLD)
      .stroke();

    // Billed to / booking reference
    let y = 130;
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(MUTED)
      .text('BILLED TO', left, y);
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(INK)
      .text(`${booking.firstName} ${booking.lastName}`, left, y + 14);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text(booking.email, left, y + 30)
      .text(booking.phone, left, y + 42);

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(MUTED)
      .text('BOOKING', left, y, { width, align: 'right' });
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(INK)
      .text(booking.id, left, y + 14, { width, align: 'right' });
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(MUTED)
      .text(`Status: ${booking.status.replaceAll('_', ' ')}`, left, y + 30, {
        width,
        align: 'right',
      })
      .text(`Booked: ${dateOnly(booking.createdAt)}`, left, y + 42, {
        width,
        align: 'right',
      });

    // Rental summary table
    y = 215;
    const days = rentalDays(booking.pickupDate, booking.returnDate);
    const pricePerDay = Number(booking.vehicle.pricePerDay);

    doc.rect(left, y, width, 22).fillColor('#F6F7F9').fill();
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(MUTED)
      .text('DESCRIPTION', left + 10, y + 7)
      .text('DETAILS', left + 230, y + 7)
      .text('AMOUNT', left, y + 7, { width: width - 10, align: 'right' });

    const rows: [string, string, string][] = [
      [
        'Vehicle rental',
        `${booking.vehicle.brand} ${booking.vehicle.model} (${booking.vehicle.name})`,
        '',
      ],
      [
        'Rental period',
        `${dateOnly(booking.pickupDate)} to ${dateOnly(booking.returnDate)} (${days} day${days === 1 ? '' : 's'})`,
        '',
      ],
      ['Pickup location', booking.pickupLocation, ''],
      ['Daily rate', `${money(pricePerDay)} x ${days}`, money(booking.totalAmount)],
    ];

    y += 22;
    for (const [label, detail, amount] of rows) {
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(INK)
        .text(label, left + 10, y + 8);
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(MUTED)
        .text(detail, left + 230, y + 8, { width: width - 330 });
      if (amount) {
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(INK)
          .text(amount, left, y + 8, { width: width - 10, align: 'right' });
      }
      y += 26;
      doc
        .moveTo(left, y)
        .lineTo(right, y)
        .lineWidth(0.5)
        .strokeColor(RULE)
        .stroke();
    }

    // Total
    y += 14;
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor(INK)
      .text('TOTAL PAID', left + 10, y);
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(GOLD)
      .text(money(payment.amount), left, y - 2, {
        width: width - 10,
        align: 'right',
      });

    // Payment info
    y += 40;
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(MUTED)
      .text('PAYMENT', left, y);
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(INK)
      .text(`Method: ${payment.provider}`, left, y + 14)
      .text(`Transaction: ${payment.transactionId ?? '—'}`, left, y + 26)
      .text(
        `Paid at: ${(payment.paidAt ?? booking.updatedAt).toISOString().replace('T', ' ').slice(0, 16)} UTC`,
        left,
        y + 38,
      )
      .text('Status: PAID', left, y + 50);

    // Footer
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(MUTED)
      .text(
        'Thank you for choosing VRentNow. This receipt was generated electronically and is valid without a signature.',
        left,
        doc.page.height - 90,
        { width, align: 'center' },
      );

    doc.end();
    const buffer = await done;
    return { buffer, filename: `vrentnow-receipt-${booking.id}.pdf` };
  }
}
