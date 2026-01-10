// ============================================
// src/entities/user.entity.ts - COMPLETE FILE
// ============================================
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Link } from './link.entity';

export enum SubscriptionTier {
  FREE = 'free',
  EXTENDED = 'extended',
  ULTIMATE = 'ultimate',
  ENTERPRISE = 'enterprise'
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  GITHUB = 'github'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  providerId: string;

  @Column({ type: 'enum', enum: SubscriptionTier, default: SubscriptionTier.FREE })
  subscriptionTier: SubscriptionTier;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Link, link => link.user)
  links: Link[];
}

