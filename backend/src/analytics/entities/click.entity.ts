import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Link } from '../../links/entities/link.entity';

@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'link_id' })
  @Index()
  linkId: number;

  @ManyToOne(() => Link, (link) => link.clicks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'link_id' })
  link: Link;

  @CreateDateColumn({ name: 'clicked_at' })
  @Index()
  clickedAt: Date;

  @Column({ length: 64, nullable: true, name: 'ip_address_hash' })
  ipAddressHash: string | null;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string | null;

  @Column({ type: 'text', nullable: true })
  referer: string | null;

  @Column({ length: 2, nullable: true })
  country: string | null;

  @Column({ length: 100, nullable: true })
  city: string | null;
}