import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('AccountsController (e2e)', () => {
  let app: INestApplication;
  const dbPath = path.join(__dirname, '../test-accounts.db');
  
  // Set env vars before any imports that might use them (though imports are cached, so purely mainly for AppModule init)
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
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/accounts (POST) should create an account', async () => {
    const createAccountDto = {
      name: 'Test Savings',
      initialBalance: 1000,
      type: 'DEBIT',
    };

    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send(createAccountDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createAccountDto.name);
    expect(Number(response.body.initialBalance)).toBe(createAccountDto.initialBalance);
    expect(response.body.type).toBe(createAccountDto.type);
  });

  it('/accounts (GET) should retrieve created accounts', async () => {
    const response = await request(app.getHttpServer())
      .get('/accounts')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    const account = response.body.find((a: any) => a.name === 'Test Savings');
    expect(account).toBeDefined();
  });
});
