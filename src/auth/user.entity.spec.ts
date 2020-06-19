import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    (bcrypt.hash as any) = jest.fn();
  });

  describe('validatePassword', () => {
    const successPassword = 'testPassword'; // because user.password === 'testPassword'
    const wrongPassword = 'wrongPassword'; // because user.password !== 'wrongPassword'
    it('returns true as password is valid', async () => {
      bcrypt.hash.mockReturnValue(successPassword); // bcrypt.hash is Promise
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.isPasswordValid(successPassword);
      await expect(bcrypt.hash).toHaveBeenCalledWith(
        successPassword,
        'testSalt',
      ); // bcrypt.hash is Promise
      expect(result).toEqual(true);
    });

    it('returns false as password is invalid', async () => {
      bcrypt.hash.mockReturnValue(wrongPassword); // bcrypt.hash is Promise
      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await user.isPasswordValid(wrongPassword);
      await expect(bcrypt.hash).toHaveBeenCalledWith(wrongPassword, 'testSalt'); // bcrypt.hash is Promise
      expect(result).toEqual(false);
    });
  });
});
