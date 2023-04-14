"use strict";

/** Error class for when the server is unreachable */
class ServerUnreachableError extends Error {
  constructor(message) {
    super(message);
    this.name = "ServerUnreachableError";
  }
}

/** Error class for when user inputs a bad URL in submission */
class BadURLError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadURLError";
  }
}

/** Error class for when the user's credentials are invalid */
class NotAuthenticatedError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotAuthenticatedError";
  }
}

/** Error class for when the username is already in use */
class UserAlreadyExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = "UserAlreadyExistsError";
  }
}
