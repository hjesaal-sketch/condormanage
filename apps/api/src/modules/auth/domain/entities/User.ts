import { compare } from 'bcryptjs';

export interface UserProps {
  id: string;
  email: string;
  name: string;
  password: string; // Hashed
  role: 'ADMIN' | 'RESIDENT' | 'GUEST';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id() { return this.props.id; }
  get email() { return this.props.email; }
  get name() { return this.props.name; }
  get role() { return this.props.role; }
  get tenantId() { return this.props.tenantId; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  async comparePassword(password: string): Promise<boolean> {
    return compare(password, this.props.password);
  }

  isAdmin(): boolean {
    return this.props.role === 'ADMIN';
  }

  toJSON() {
    return {
      id: this.props.id,
      email: this.props.email,
      name: this.props.name,
      role: this.props.role,
      tenantId: this.props.tenantId
    };
  }
}