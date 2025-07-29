import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Part } from '../../parts/entities/part.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'jsonb', default: {} })
  translations: {
    en: { name: string; description?: string };
    ru: { name: string; description?: string };
  };

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToMany(() => Part, (part) => part.categories)
  parts: Part[];
}