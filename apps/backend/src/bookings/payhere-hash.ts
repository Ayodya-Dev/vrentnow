import { createHash } from 'node:crypto';

/** PayHere amount format: two decimal places, no thousands separators. */
export function formatPayHereAmount(amount: string | number): string {
  return parseFloat(String(amount))
    .toLocaleString('en-us', { minimumFractionDigits: 2 })
    .replaceAll(',', '');
}

function md5Upper(value: string): string {
  return createHash('md5').update(value).digest('hex').toUpperCase();
}

/** Checkout hash — same formula as PayHere / the payhere-node sample. */
export function buildPayHereCheckoutHash(input: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency: string;
}): string {
  const hashedSecret = md5Upper(input.merchantSecret);
  return md5Upper(
    `${input.merchantId}${input.orderId}${input.amount}${input.currency}${hashedSecret}`,
  );
}

/** IPN signature check. */
export function buildPayHereNotifyHash(input: {
  merchantId: string;
  merchantSecret: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
}): string {
  const hashedSecret = md5Upper(input.merchantSecret);
  return md5Upper(
    `${input.merchantId}${input.orderId}${input.amount}${input.currency}${input.statusCode}${hashedSecret}`,
  );
}
