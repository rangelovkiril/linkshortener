import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Click } from '../../analytics/entities/click.entity';

@Entity('links')
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', name: 'original_url' })
  originalUrl: string;

  @Column({ length: 10, unique: true, name: 'short_code' })
  @Index()
  shortCode: string;

  @Column({ length: 50, unique: true, nullable: true, name: 'custom_alias' })
  @Index()
  customAlias: string | null;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'expires_at' })
  expiresAt: Date | null;

  @Column({ type: 'integer', default: 0, name: 'clicks_count' })
  clicksCount: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => Click, (click) => click.link)
  clicks: Click[];

  // Helper method to check if link is expired
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Get the shortened URL identifier (custom alias or short code)
  getIdentifier(): string {
    return this.customAlias || this.shortCode;
  }
}