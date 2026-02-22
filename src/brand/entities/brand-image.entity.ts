import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Brand } from './brand.entity';

@Entity()
export class BrandImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column()
  name: string;

  @Column()
  path: string;

  @ManyToOne(() => Brand, (brand) => brand.images, {
    onDelete: 'CASCADE',
  })
  entity_id: Brand;
}
