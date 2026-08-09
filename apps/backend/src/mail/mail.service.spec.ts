import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { TemplateRenderer } from './template.renderer';

describe('MailService', () => {
  let transport: { send: jest.Mock };
  let service: MailService;

  beforeEach(() => {
    transport = { send: jest.fn(async () => undefined) };
    const config = { get: () => 'Acme Inc' } as unknown as ConfigService;
    service = new MailService(transport as any, new TemplateRenderer(config));
  });

  it('sendPasswordReset renders and sends to the recipient', async () => {
    await service.sendPasswordReset('jan@x.com', {
      name: 'Jan',
      resetUrl: 'https://web.test/reset-password?token=RAW',
      ttlMins: 30,
    });

    expect(transport.send).toHaveBeenCalledTimes(1);
    const msg = transport.send.mock.calls[0][0] as any;
    expect(msg.to).toBe('jan@x.com');
    expect(msg.subject).toMatch(/reset/i);
    expect(msg.html).toContain('https://web.test/reset-password?token=RAW');
    expect(msg.text).toContain('https://web.test/reset-password?token=RAW');
  });

  it('sendPasswordChanged renders and sends', async () => {
    await service.sendPasswordChanged('jan@x.com', { name: 'Jan' });
    const msg = transport.send.mock.calls[0][0] as any;
    expect(msg.to).toBe('jan@x.com');
    expect(msg.subject).toMatch(/changed/i);
  });

  const bookingData = {
    name: 'Jan',
    bookingId: 'bk_1',
    vehicleName: 'Toyota Aqua',
    pickupDate: '2026-08-10',
    returnDate: '2026-08-12',
    totalAmount: 'LKR 15,000',
    bookingUrl: 'http://localhost:3000/bookings/bk_1',
    pickupLocation: 'Colombo',
  };

  it('sendBookingPaid renders and sends', async () => {
    await service.sendBookingPaid('jan@x.com', bookingData);
    const msg = transport.send.mock.calls[0][0] as any;
    expect(msg.to).toBe('jan@x.com');
    expect(msg.subject).toMatch(/payment received/i);
    expect(msg.html).toContain('Toyota Aqua');
    expect(msg.html).toContain('http://localhost:3000/bookings/bk_1');
  });

  it('sendBookingConfirmed renders and sends', async () => {
    await service.sendBookingConfirmed('jan@x.com', bookingData);
    expect((transport.send.mock.calls[0][0] as any).subject).toMatch(
      /confirmed/i,
    );
  });

  it('sendBookingCancelled renders and sends', async () => {
    await service.sendBookingCancelled('jan@x.com', {
      ...bookingData,
      cancelReason: 'Changed plans',
    });
    const msg = transport.send.mock.calls[0][0] as any;
    expect(msg.subject).toMatch(/cancelled/i);
    expect(msg.html).toContain('Changed plans');
  });

  it('sendBookingCompleted renders and sends', async () => {
    await service.sendBookingCompleted('jan@x.com', bookingData);
    expect((transport.send.mock.calls[0][0] as any).subject).toMatch(
      /completed/i,
    );
  });
});
