import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const dbPath = path.join(__dirname, '../test-app.db');
  
  // Set env vars before any imports
  process.env.DATABASE_URL = `file:${dbPath}`;

  beforeAll(() => {
    // Ensure clean start
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    // Setup DB schema
    try {
      execSync('npx prisma db push --schema=prisma/schema.prisma --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: `file:${dbPath}` }
      });
    } catch (e) {
      console.error('Failed to push schema', e);
      throw e;
    }
  });

  afterAll(() => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Hello from API');
    expect(response.body).toHaveProperty('timestamp');
  });
});
