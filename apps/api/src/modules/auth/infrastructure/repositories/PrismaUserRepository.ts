import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../application/ports/IUserRepository';
import { User } from '../../domain/entities/User';
import { hash } from 'bcryptjs';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) return null;

    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role as any,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

  async create(data: {
    email: string;
    name: string;
    password: string;
    role: string;
    tenantId: string;
  }): Promise<User> {
    const hashedPassword = await hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: data.role as any,
        tenantId: data.tenantId
      }
    });

    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      role: user.role as any,
      tenantId: user.tenantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }
}