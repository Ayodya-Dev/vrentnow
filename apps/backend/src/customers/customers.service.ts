import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { Role } from '../types/role.enum';
import { CustomersRepository, CustomerRow } from './customers.repository';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';

export interface CustomerView {
  id: string;
  email: string;
  username: string;
  /** Latest booking contact phone, if any. */
  phone: string | null;
  /** Latest booking contact name, if any. */
  contactName: string | null;
  createdAt: Date;
  disabledAt: Date | null;
  lockedUntil: Date | null;
  failedLoginAttempts: number;
  bookingCount: number;
}

@Injectable()
export class CustomersService {
  constructor(
    private readonly repo: CustomersRepository,
    private readonly audit: AuditService,
  ) {}

  private toView(user: CustomerRow): CustomerView {
    const latest = user.bookings[0];
    const contactName = latest
      ? `${latest.firstName} ${latest.lastName}`.trim()
      : null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: latest?.phone ?? null,
      contactName: contactName || null,
      createdAt: user.createdAt,
      disabledAt: user.disabledAt,
      lockedUntil: user.lockedUntil,
      failedLoginAttempts: user.failedLoginAttempts,
      bookingCount: user._count.bookings,
    };
  }

  private isCustomer(user: CustomerRow): boolean {
    const roles = user.roles.map((r) => r.role as Role);
    return (
      roles.includes(Role.USER) &&
      roles.every((role) => role === Role.USER)
    );
  }

  private async requireCustomer(id: string): Promise<CustomerRow> {
    const user = await this.repo.findById(id);
    if (!user || !this.isCustomer(user)) {
      throw new NotFoundException('Customer not found');
    }
    return user;
  }

  async list(
    query: ListCustomersQueryDto,
  ): Promise<PaginatedResult<CustomerView>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const filters = {
      search: query.search?.trim(),
      disabled: query.disabled,
    };
    const [rows, total] = await Promise.all([
      this.repo.findMany(filters, skip, take),
      this.repo.count(filters),
    ]);
    return buildPaginatedResult(
      rows.map((u) => this.toView(u)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<CustomerView> {
    return this.toView(await this.requireCustomer(id));
  }

  async disable(id: string, actorId: string): Promise<CustomerView> {
    const user = await this.requireCustomer(id);
    if (user.disabledAt) {
      throw new BadRequestException('Customer is already disabled');
    }
    const updated = await this.repo.setDisabledAt(id, new Date());
    await this.repo.revokeSessions(id);
    await this.audit.record({
      actorId,
      action: 'customers.disable',
      entity: 'User',
      entityId: id,
    });
    return this.toView(updated);
  }

  async enable(id: string, actorId: string): Promise<CustomerView> {
    const user = await this.requireCustomer(id);
    if (!user.disabledAt) {
      throw new BadRequestException('Customer is already enabled');
    }
    const updated = await this.repo.setDisabledAt(id, null);
    await this.audit.record({
      actorId,
      action: 'customers.enable',
      entity: 'User',
      entityId: id,
    });
    return this.toView(updated);
  }

  async unlock(id: string, actorId: string): Promise<CustomerView> {
    await this.requireCustomer(id);
    const updated = await this.repo.unlock(id);
    await this.audit.record({
      actorId,
      action: 'customers.unlock',
      entity: 'User',
      entityId: id,
    });
    return this.toView(updated);
  }
}
