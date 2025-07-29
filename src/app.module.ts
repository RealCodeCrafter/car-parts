import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import {
  I18nModule,
  I18nJsonLoader,
  HeaderResolver,
  QueryResolver,
} from 'nestjs-i18n';
import * as path from 'path';

import { Part } from './parts/entities/part.entity';
import { User } from './auth/entities/auth.entity';
import { Category } from './categories/entities/category.entity';

import { AuthModule } from './auth/auth.module';
import { PartsModule } from './parts/parts.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'Uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'carpar',
      entities: [Part, User, Category],
      synchronize: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loader: I18nJsonLoader,
      loaderOptions: {
        path: path.join(__dirname, '../src/i18n'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['accept-language'] },
      ],
    }),
    PartsModule,
    AuthModule,
    CategoriesModule,
    ContactModule,
  ],
})
export class AppModule {}
