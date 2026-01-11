import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Link } from '../../links/entities/link.entity';

export enum SubscriptionLevel {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: SubscriptionLevel.FREE,
    name: 'subscription_level',
  })
  subscriptionLevel: SubscriptionLevel;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Link, (link) => link.user)
  links: Link[];

  // Helper method to get subscription limits
  getSubscriptionLimits() {
    const limits = {
      free: {
        maxLinks: 10,
        maxCustomAliases: 2,
        analyticsRetentionDays: 7,
        rateLimitPerMinute: 10,
      },
      pro: {
        maxLinks: 1000,
        maxCustomAliases: 100,
        analyticsRetentionDays: 90,
        rateLimitPerMinute: 100,
      },
      enterprise: {
        maxLinks: -1, // Unlimited
        maxCustomAliases: -1,
        analyticsRetentionDays: 365,
        rateLimitPerMinute: 1000,
      },
    };

    return limits[this.subscriptionLevel] || limits.free;
  }
}