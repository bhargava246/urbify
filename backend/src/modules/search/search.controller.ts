import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SaveSearchDto } from './dto/save-search.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post('saved')
  @ApiOperation({ summary: 'Save a search for alerts' })
  saveSearch(@Body() dto: SaveSearchDto, @CurrentUser() user: JwtPayload) {
    return this.searchService.saveSearch(user.sub, dto);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get my saved searches' })
  getSaved(@CurrentUser() user: JwtPayload) {
    return this.searchService.getSavedSearches(user.sub);
  }

  @Delete('saved/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a saved search' })
  deleteSaved(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.searchService.deleteSavedSearch(user.sub, id);
  }

  @Post('shortlist/:listingId')
  @ApiOperation({ summary: 'Add listing to shortlist / wishlist' })
  addShortlist(@Param('listingId') listingId: string, @CurrentUser() user: JwtPayload) {
    return this.searchService.addToShortlist(user.sub, listingId);
  }

  @Delete('shortlist/:listingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove listing from shortlist' })
  removeShortlist(@Param('listingId') listingId: string, @CurrentUser() user: JwtPayload) {
    return this.searchService.removeFromShortlist(user.sub, listingId);
  }

  @Get('shortlist')
  @ApiOperation({ summary: 'Get my shortlisted properties' })
  getShortlist(@CurrentUser() user: JwtPayload) {
    return this.searchService.getShortlist(user.sub);
  }
}
