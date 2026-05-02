import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  async findAll() {
    return await this.packageRepository.find();
  }

  async create(packageData: any) {
    const newPackage = this.packageRepository.create(packageData);
    return await this.packageRepository.save(newPackage);
  }

  // ✅ Delete fix
  async remove(id: number) {
    const pkg = await this.packageRepository.findOneBy({ id });
    if (!pkg) throw new NotFoundException('Package not found');
    return await this.packageRepository.delete(id);
  }
}