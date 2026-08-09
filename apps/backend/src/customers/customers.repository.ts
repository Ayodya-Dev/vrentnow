import { Injectable } from '@nestjs/common';
import { Booking, Prisma, User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../types/role.enum';

export type CustomerRow = User & {
  roles: UserRole[];
  bookings: Pick<Booking, 'phone' | 'firstName' | 'lastName'>[];
  _count: { bookings: number };
};

export interface CustomerFilters {
  search?: string;
  disabled?: boolean;
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private customerWhere(filters: CustomerFilters): Prisma.UserWhereInput {
    const and: Prisma.UserWhereInput[] = [
      { roles: { some: { role: Role.USER } } },
      { roles: { none: { role: { not: Role.USER } } } },
    ];
    if (filters.disabled === true) {
      and.push({ disabledAt: { not: null } });
    } else if (filters.disabled === false) {
      and.push({ disabledAt: null });
    }
    if (filters.search) {
      and.push({
        OR: [
          { username: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          {
            bookings: {
              some: {
                phone: { contains: filters.search, mode: 'insensitive' },
              },
            },
          },
        ],
      });
    }
    return { AND: and };
  }

  private include = {
    roles: true,
    bookings: {
      select: { phone: true, firstName: true, lastName: true },
      orderBy: { createdAt: 'desc' as const },
      take: 1,
    },
    _count: { select: { bookings: true } },
  } as const;

  async findMany(
    filters: CustomerFilters,
    skip: number,
    take: number,
  ): Promise<CustomerRow[]> {
    return this.prisma.user.findMany({
      where: this.customerWhere(filters),
      include: this.include,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async count(filters: CustomerFilters): Promise<number> {
    return this.prisma.user.count({ where: this.customerWhere(filters) });
  }

  async findById(id: string): Promise<CustomerRow | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: this.include,
    });
  }

  async setDisabledAt(id: string, disabledAt: Date | null): Promise<CustomerRow> {
    return this.prisma.user.update({
      where: { id },
      data: { disabledAt },
      include: this.include,
    });
  }

  async unlock(id: string): Promise<CustomerRow> {
    return this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
      include: this.include,
    });
  }

  async revokeSessions(id: string): Promise<void> {
    await this.prisma.authSession.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
