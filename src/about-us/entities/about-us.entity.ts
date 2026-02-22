import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LANG } from 'src/common/enums/translation.enum';

@Entity()
export class AboutUs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  custom_id: string;

  @Column({ type: 'jsonb', default: '{}' })
  structure: string;

  @Column({ enum: LANG, default: LANG.UA })
  lang: LANG;

  @Column({ default: '' })
  seo_title: string;

  @Column({ type: 'text', default: '' })
  seo_description: string;

  @Column({ type: 'text', default: '' })
  seo_text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
