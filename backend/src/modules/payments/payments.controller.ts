import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { CreateOrderDto, VerifyPaymentDto, RefundRequestDto } from './dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders')
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Initiate PhonePe payment to unlock a listing contact' })
  createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.createOrder(user.sub, dto);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Verify PhonePe payment status and activate unlock' })
  verifyPayment(@Body() dto: VerifyPaymentDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.verifyPayment(user.sub, dto);
  }

  @Public()
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PhonePe server-to-server payment callback (webhook)' })
  handleCallback(@Body() body: { response: string }) {
    return this.paymentsService.handleCallback(body);
  }

  @Post('refunds/:unlockId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.CLIENT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Request refund within 24 hours of unlock' })
  requestRefund(
    @Param('unlockId') unlockId: string,
    @Body() dto: RefundRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.paymentsService.requestRefund(user.sub, unlockId, dto);
  }

  @Get('revenue')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[ADMIN] Revenue summary with date range' })
  getRevenue(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.paymentsService.getRevenueSummary(new Date(from), new Date(to));
  }
}
