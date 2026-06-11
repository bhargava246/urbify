import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ListingStatus, Role } from '@prisma/client';
import { memoryStorage } from 'multer';
import { PropertiesService } from './properties.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateListingDto, SearchListingDto, UpdateListingDto } from './dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Properties')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ─── Public endpoints ──────────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search / list properties (public)' })
  search(@Query() dto: SearchListingDto) {
    return this.propertiesService.searchListings(dto);
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'Get city stats (listing count + avg rent) for homepage' })
  getCities() {
    return this.propertiesService.getCityStats();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public listing details (address hidden)' })
  getPublic(@Param('id') id: string) {
    return this.propertiesService.getListingPublic(id);
  }

  // ─── Authenticated endpoints ───────────────────────────────────────────────────

  @Get(':id/full')
  @ApiOperation({ summary: 'Get listing with full address (requires unlock)' })
  getFull(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.getListingWithAddress(id, user.sub);
  }

  @Post()
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new listing' })
  create(@Body() dto: CreateListingDto, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.createListing(user.sub, dto, user.role as Role);
  }

  @Get('my/listings')
  @Roles(Role.OWNER, Role.BROKER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get my listings' })
  getMyListings(@CurrentUser() user: JwtPayload) {
    return this.propertiesService.getOwnerListings(user.sub);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.BROKER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update listing' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.propertiesService.updateListing(id, user.sub, dto);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.BROKER, Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete listing' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.deleteListing(id, user.sub, user.role as Role);
  }

  @Patch(':id/status')
  @Roles(Role.OWNER, Role.BROKER)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Change listing status (pause / mark rented-sold)' })
  setStatus(
    @Param('id') id: string,
    @Body() body: { status: ListingStatus },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.propertiesService.setListingStatus(id, user.sub, body.status);
  }

  @Post(':id/photos')
  @Roles(Role.OWNER, Role.BROKER)
  @UseGuards(RolesGuard)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload photos for a listing (min 3 required to activate)' })
  async uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    const uploaded = await this.uploadsService.uploadFiles(files, `listings/${id}`);
    return this.propertiesService.addPhotos(
      id,
      user.sub,
      uploaded.map((u, i) => ({ s3Key: u.s3Key, s3Url: u.s3Url, order: i })),
    );
  }

  // ─── Admin endpoints ───────────────────────────────────────────────────────────

  @Get('admin/all')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[ADMIN] List all listings with status filter' })
  @ApiQuery({ name: 'status', enum: ListingStatus, required: false })
  adminList(
    @Query('status') status: ListingStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.propertiesService.adminListAll(status, +page, +limit);
  }

  @Patch('admin/:id/moderate')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: '[ADMIN] Approve or reject listing' })
  moderate(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'REJECTED'; note?: string },
  ) {
    return this.propertiesService.moderateListing(id, body.status, body.note);
  }
}
