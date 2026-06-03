import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Get('me/unlocks')
  @ApiOperation({ summary: 'Get my contact unlock history (CLIENT)' })
  getMyUnlocks(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationDto,
  ) {
    return this.usersService.getUserUnlocks(user.sub, pagination);
  }

  // ─── Admin endpoints ──────────────────────────────────────────────────────────

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[ADMIN] List all users' })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  listUsers(@Query() pagination: PaginationDto, @Query('role') role?: Role) {
    return this.usersService.listUsers(pagination, role);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[ADMIN] Ban or activate a user' })
  setStatus(
    @Param('id') id: string,
    @Body() body: { isBanned: boolean; isActive: boolean },
  ) {
    return this.usersService.setUserStatus(id, body.isBanned, body.isActive);
  }
}
