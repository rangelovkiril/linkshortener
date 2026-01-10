// ============================================
// src/entities/link.entity.ts - COMPLETE FILE
// ============================================
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { LinkStatistic } from './link-statistic.entity';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  shortCode: string;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ nullable: true })
  label: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  isCustomSlug: boolean;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, user => user.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LinkStatistic, stat => stat.link)
  statistics: LinkStatistic[];
}