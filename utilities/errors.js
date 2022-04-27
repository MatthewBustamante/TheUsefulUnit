class ValidationError extends Error {}

class DatabaseWriteError extends Error {}

class DatabaseReadError extends Error {}

class UserNotFoundError extends Error {}

class PasswordError extends Error {}

class LoginError extends Error {}

class DatabaseConnectionError extends Error {}

module.exports = {
  ValidationError,
  DatabaseWriteError,
  DatabaseReadError,
  UserNotFoundError,
  PasswordError,
  LoginError,
  DatabaseConnectionError,
};
