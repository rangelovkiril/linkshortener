// ============================================
// src/entities/link-statistic.entity.ts - COMPLETE FILE
// ============================================
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Link } from './link.entity';

export enum StatisticType {
  CLICK = 'click',
  REFERRER = 'referrer',
  BROWSER = 'browser',
  OS = 'os',
  DEVICE = 'device',
  COUNTRY = 'country'
}

@Entity('link_statistics')
export class LinkStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  linkId: string;

  @ManyToOne(() => Link, link => link.statistics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'linkId' })
  link: Link;

  @Column({ type: 'enum', enum: StatisticType })
  type: StatisticType;

  @Column({ type: 'jsonb' })
  data: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}