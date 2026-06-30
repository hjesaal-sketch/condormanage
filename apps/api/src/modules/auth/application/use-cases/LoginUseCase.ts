import { IUserRepository } from '../ports/IUserRepository';
import { ITokenService } from '../ports/ITokenService';
import { User } from '../../domain/entities/User';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string;
  };
  token: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isValid = await user.comparePassword(input.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = this.tokenService.generate({
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    });

    return {
      user: user.toJSON(),
      token
    };
  }
}