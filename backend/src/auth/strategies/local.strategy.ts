import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Dependencies } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
@Dependencies(AuthService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
    this.authService = authService;
  }

  validate(email: string, password: string) {
    return this.authService.validateUser({ email }, password);
  }
}
