import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthCacheService } from '../../auth/services/auth-cache.service';
import { createTestDb } from '../../../test/utils/test-db';
import { UsersRepository } from '@ryla/data';
import { _NotFoundException, _ConflictException } from '@nestjs/common';
import { vi } from 'vitest';

describe('UserService Integration', () => {
    let service: UserService;
    let db: any;
    let client: any;
    let usersRepo: UsersRepository;
    let authCacheMock: any;
    let testCounter = 0;

    const getUniqueUser = () => {
        const id = ++testCounter;
        return {
            email: `unique-${id}-${Date.now()}@example.com`,
            password: 'hashedpassword',
            name: `User ${id}`,
            publicName: `pub-${id}-${Date.now()}`,
        };
    };

    beforeEach(async () => {
        const testDb = await createTestDb();
        db = testDb.db;
        client = testDb.client;
        usersRepo = new UsersRepository(db);

        authCacheMock = {
            deleteAllUserTokens: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: 'DRIZZLE_DB', useValue: db },
                { provide: AuthCacheService, useValue: authCacheMock },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    afterEach(async () => {
        if (client) await client.close();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('isEmailExistOrThrow', () => {
        it('should do nothing if email does not exist', async () => {
            await expect(service.isEmailExistOrThrow('none@example.com')).resolves.not.toThrow();
        });

        it('should throw ConflictException if email exists', async () => {
            const user = getUniqueUser();
            await usersRepo.create(user);
            await expect(service.isEmailExistOrThrow(user.email)).rejects.toThrow('This email is already in use');
        });
    });

    describe('isPublicNameExistOrThrow', () => {
        it('should do nothing if public name does not exist', async () => {
            await expect(service.isPublicNameExistOrThrow('none-pub')).resolves.not.toThrow();
        });

        it('should throw ConflictException if public name exists', async () => {
            const user = getUniqueUser();
            await usersRepo.create(user);
            await expect(service.isPublicNameExistOrThrow(user.publicName)).rejects.toThrow('This public name already exists');
        });
    });

    describe('getUserById', () => {
        it('should return a user if it exists', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create(user);
            const found = await service.getUserById(created.id);
            expect(found.email).toBe(user.email);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            const validNonExistentId = '00000000-0000-0000-0000-000000000000';
            await expect(service.getUserById(validNonExistentId)).rejects.toThrow('User not found');
        });
    });

    describe('getUserByEmail', () => {
        it('should return a user if it exists', async () => {
            const user = getUniqueUser();
            await usersRepo.create(user);
            const found = await service.getUserByEmail(user.email);
            expect(found.email).toBe(user.email);
        });

        it('should throw NotFoundException if user does not exist', async () => {
            await expect(service.getUserByEmail('nonexistent@example.com')).rejects.toThrow('User not found');
        });
    });

    describe('getUserProfile', () => {
        it('should return profile without password', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create(user);
            const profile = await service.getUserProfile(created.id);
            expect(profile.email).toBe(user.email);
            expect((profile as any).password).toBeUndefined();
        });
    });

    describe('updateProfile', () => {
        it('should update name and public name', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create(user);
            const newName = 'John Updated';
            const newPubName = 'pub-updated-' + Date.now();
            const updated = await service.updateProfile(created.id, {
                name: newName,
                publicName: newPubName,
            });
            expect(updated.name).toBe(newName);
            expect(updated.publicName).toBe(newPubName);
        });

        it('should throw ConflictException if public name is already taken by another', async () => {
            const user1 = getUniqueUser();
            const user2 = getUniqueUser();
            await usersRepo.create(user1);
            const created2 = await usersRepo.create(user2);

            await expect(
                service.updateProfile(created2.id, { publicName: user1.publicName }),
            ).rejects.toThrow('This public name already exists');
        });

        it('should throw NotFoundException if user to update does not exist', async () => {
            const validNonExistentId = '00000000-0000-0000-0000-000000000000';
            await expect(service.updateProfile(validNonExistentId, { name: 'New' })).rejects.toThrow('User not found');
        });
    });

    describe('updateSettings', () => {
        it('should update user settings', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create(user);
            const settings = '{"theme":"light"}';
            await service.updateSettings(created.id, settings);

            const updated = await usersRepo.findById(created.id);
            expect(updated?.settings).toBe(settings);
        });

        it('should throw NotFoundException if user not found', async () => {
            const validNonExistentId = '00000000-0000-0000-0000-000000000000';
            await expect(service.updateSettings(validNonExistentId, '{}')).rejects.toThrow('User not found');
        });
    });

    describe('banUser', () => {
        it('should set banned status and invalidate tokens', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create(user);
            await service.banUser(created.id);

            const updated = await usersRepo.findById(created.id);
            expect(updated?.banned).toBe(true);
            expect(authCacheMock.deleteAllUserTokens).toHaveBeenCalledWith(created.id);
        });

        it('should throw NotFoundException if user not found', async () => {
            const validNonExistentId = '00000000-0000-0000-0000-000000000000';
            await expect(service.banUser(validNonExistentId)).rejects.toThrow('User not found');
        });
    });

    describe('unbanUser', () => {
        it('should unban user', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create({ ...user, banned: true });
            await service.unbanUser(created.id);

            const updated = await usersRepo.findById(created.id);
            expect(updated?.banned).toBe(false);
        });

        it('should throw NotFoundException if user not found', async () => {
            const validNonExistentId = '00000000-0000-0000-0000-000000000000';
            await expect(service.unbanUser(validNonExistentId)).rejects.toThrow('User not found');
        });
    });

    describe('deleteAccount', () => {
        it('should delete account and invalidate tokens', async () => {
            const user = getUniqueUser();
            const created = await usersRepo.create(user);

            await service.deleteAccount(created.id);

            const found = await usersRepo.findById(created.id);
            expect(found).toBeUndefined();
            expect(authCacheMock.deleteAllUserTokens).toHaveBeenCalledWith(created.id);
        });

        it('should throw NotFoundException if user not found', async () => {
            const validNonExistentId = '00000000-0000-0000-0000-000000000000';
            await expect(service.deleteAccount(validNonExistentId)).rejects.toThrow('User not found');
        });
    });
});
