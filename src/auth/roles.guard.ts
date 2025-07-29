import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly i18n: I18nService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const roles = this.getRoles(context);

    if (!roles.includes(user.role)) {
      throw new ForbiddenException(await this.i18n.translate('auth.no_permission'));
    }

    return true;
  }

  private getRoles(context: ExecutionContext): string[] {
    const handler = context.getHandler();
    return Reflect.getMetadata('roles', handler) || [];
  }
}