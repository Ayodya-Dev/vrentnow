import { parsePayHereNotifyBody } from './payhere-notify.dto';

describe('parsePayHereNotifyBody', () => {
  it('keeps required fields when PayHere sends extra keys', () => {
    const parsed = parsePayHereNotifyBody({
      merchant_id: 123,
      order_id: 'order-1',
      payhere_amount: 24000,
      payhere_currency: 'LKR',
      status_code: 2,
      md5sig: 'abc',
      payment_id: 'PH-1',
      captured_amount: '24000.00',
      message: 'Successfully completed',
    });

    expect(parsed).toEqual({
      merchant_id: '123',
      order_id: 'order-1',
      payhere_amount: '24000',
      payhere_currency: 'LKR',
      status_code: '2',
      md5sig: 'abc',
      payment_id: 'PH-1',
    });
  });
});
