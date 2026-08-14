import { createHash } from 'node:crypto';
import {
  buildPayHereCheckoutHash,
  buildPayHereNotifyHash,
  formatPayHereAmount,
} from './payhere-hash';

describe('payhere-hash', () => {
  const merchantId = '1247434';
  const merchantSecret = 'testsecret';
  const orderId = 'order-1';
  const amount = formatPayHereAmount('1000');
  const currency = 'LKR';

  it('formats amount without thousands separators', () => {
    expect(formatPayHereAmount(1234.5)).toBe('1234.50');
    expect(formatPayHereAmount('1000')).toBe('1000.00');
  });

  it('matches the payhere-node checkout hash formula', () => {
    const hashedSecret = createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();
    const expected = createHash('md5')
      .update(merchantId + orderId + amount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    expect(
      buildPayHereCheckoutHash({
        merchantId,
        merchantSecret,
        orderId,
        amount,
        currency,
      }),
    ).toBe(expected);
  });

  it('matches the payhere-node notify hash formula', () => {
    const statusCode = '2';
    const hashedSecret = createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();
    const expected = createHash('md5')
      .update(
        merchantId + orderId + amount + currency + statusCode + hashedSecret,
      )
      .digest('hex')
      .toUpperCase();

    expect(
      buildPayHereNotifyHash({
        merchantId,
        merchantSecret,
        orderId,
        amount,
        currency,
        statusCode,
      }),
    ).toBe(expected);
  });
});
