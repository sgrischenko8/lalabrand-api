import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LANG } from 'src/common/enums/translation.enum';

@Entity()
export class Contacts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column({ type: 'jsonb' })
  structure: string;

  @Column({ enum: LANG, default: LANG.UA })
  lang: LANG;

  @Column()
  seo_title: string;

  @Column({ type: 'text' })
  seo_description: string;

  @Column({ type: 'text' })
  seo_text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
