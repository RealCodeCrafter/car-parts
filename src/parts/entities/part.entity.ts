import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Part {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column({ type: 'jsonb', default: {} })
  translations: {
    en: { name: string; shortDescription?: string; description?: string };
    ru: { name: string; shortDescription?: string; description?: string };
  };

  @Column()
  visibilityInCatalog: string;

  @Column({ nullable: true })
  translationGroup?: string;

  @Column({ default: true })
  inStock: boolean;

  @Column('text', { array: true, nullable: true })
  images?: string[];

  @Column({ nullable: true })
  carName?: string;

  @Column('text', { array: true, nullable: true })
  model?: string[];

  @Column('text', { array: true, nullable: true })
  oem?: string[];

  @Column({ nullable: true })
  years?: string;

  @Column('float')
  price: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  trtCode: string;

  @Column()
  brand: string;

  @ManyToMany(() => Category, (category) => category.parts, { cascade: true })
  @JoinTable()
  categories: Category[];
}