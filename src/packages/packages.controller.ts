import { Controller, Get, Post, Body, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  async create(@Body() packageData: any) {
    return await this.packagesService.create(packageData);
  }

  @Get()
  async findAll() {
    return await this.packagesService.findAll();
  }

  // ✅ Delete fix
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.packagesService.remove(id);
  }
}