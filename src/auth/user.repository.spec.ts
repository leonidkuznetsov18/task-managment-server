import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto = {
  username: 'TestUsername',
  password: 'TestPassword',
};

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save });
    });

    it('successfully signs up the user', async () => {
      save.mockResolvedValue(undefined); // save is Promise
      await expect(
        userRepository.signUp(mockCredentialsDto),
      ).resolves.not.toThrow();
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '23505' }); // save is Promise
      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws a conflict exception as username already exists', async () => {
      save.mockRejectedValue({ code: '123123' }); // unhandled error code, save is Promise
      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validatePassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn(); // findOne is Promise
      user = new User();
      user.username = 'TestUsername';
      user.isPasswordValid = jest.fn(); // isPasswordValid is Promise
    });

    it('returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user); // findOne is Promise
      user.isPasswordValid.mockResolvedValue(true); // isPasswordValid is Promise

      const result = await userRepository.validatePassword(mockCredentialsDto);
      expect(result).toEqual('TestUsername');
    });

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null); // findOne is Promise
      const result = await userRepository.validatePassword(mockCredentialsDto);
      expect(user.isPasswordValid).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user); // findOne is Promise
      user.isPasswordValid.mockResolvedValue(false); // isPasswordValid is Promise
      const result = await userRepository.validatePassword(mockCredentialsDto);
      expect(user.isPasswordValid).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      (bcrypt.hash as any) = jest.fn().mockResolvedValue('testHash'); // bcrypt.hash is Promise
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash');
    });
  });
});
