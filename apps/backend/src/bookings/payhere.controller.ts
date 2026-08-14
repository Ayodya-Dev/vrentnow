import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { BookingsService } from './bookings.service';
import { PayHereNotifyDto } from './dto/payhere-notify.dto';

/**
 * Public PayHere IPN endpoint — no JWT.
 * PayHere POSTs application/x-www-form-urlencoded to notify_url.
 */
@ApiExcludeController()
@SkipThrottle()
@Controller({ path: 'payhere', version: '1' })
export class PayHereController {
  private readonly logger = new Logger(PayHereController.name);

  constructor(
    private readonly bookings: BookingsService,
    private readonly config: ConfigService,
  ) {}

  /** PayHere redirects the customer here after payment — bounce to the web app. */
  @Get('return/:bookingId')
  returnRedirect(@Param('bookingId') bookingId: string, @Res() res: Response) {
    const web = (
      this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
    res.redirect(`${web}/bookings/${bookingId}/pay/return`);
  }

  /** PayHere redirects here if the customer cancels checkout. */
  @Get('cancel/:bookingId')
  cancelRedirect(@Param('bookingId') bookingId: string, @Res() res: Response) {
    const web = (
      this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
    res.redirect(`${web}/bookings/${bookingId}/pay/cancel`);
  }

  @Post('notify')
  @HttpCode(HttpStatus.OK)
  async notify(@Body() dto: PayHereNotifyDto): Promise<{ status: string }> {
    const result = await this.bookings.handlePayHereNotify(dto);
    if (!result.ok) {
      this.logger.warn(`PayHere notify rejected: ${result.reason}`);
    }
    // Always 200 — PayHere retries aggressively on non-2xx.
    return { status: 'OK' };
  }
}
