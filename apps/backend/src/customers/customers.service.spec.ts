import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CustomersService } from './customers.service';

function customer(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    email: 'cust@example.com',
    username: 'cust',
    password: 'hash',
    disabledAt: null as Date | null,
    lockedUntil: null,
    failedLoginAttempts: 0,
    createdAt: new Date('2026-01-01'),
    roles: [{ role: Role.USER }],
    bookings: [
      { phone: '0771234567', firstName: 'Ada', lastName: 'Lovelace' },
    ],
    _count: { bookings: 2 },
    ...overrides,
  };
}

describe('CustomersService', () => {
  let repo: {
    findById: jest.Mock;
    setDisabledAt: jest.Mock;
    revokeSessions: jest.Mock;
    unlock: jest.Mock;
  };
  let audit: { record: jest.Mock };
  let svc: CustomersService;

  beforeEach(() => {
    repo = {
      findById: jest.fn(async () => customer()),
      setDisabledAt: jest.fn(async (...args: unknown[]) =>
        customer({ disabledAt: args[1] as Date | null }),
      ),
      revokeSessions: jest.fn(async () => undefined),
      unlock: jest.fn(async () => customer({ failedLoginAttempts: 0 })),
    };
    audit = { record: jest.fn(async () => undefined) };
    svc = new CustomersService(repo as never, audit as never);
  });

  it('rejects staff accounts as customers', async () => {
    repo.findById.mockResolvedValueOnce(
      customer({ roles: [{ role: Role.ADMIN }] }) as never,
    );
    await expect(svc.findOne('c1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('exposes latest booking phone and contact name', async () => {
    const view = await svc.findOne('c1');
    expect(view.phone).toBe('0771234567');
    expect(view.contactName).toBe('Ada Lovelace');
  });

  it('disables and revokes sessions', async () => {
    const view = await svc.disable('c1', 'admin1');
    expect(view.disabledAt).toBeTruthy();
    expect(repo.revokeSessions).toHaveBeenCalledWith('c1');
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'customers.disable' }),
    );
  });
});
