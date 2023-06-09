"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const url = new URL(this.url);
    return url.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;

    this.storyMap = {};
    this.addStoriesToMap(stories);
  }

  //TODO: think about it
  // get stories() {
  //   return Object.values(this.storyMap);
  // }

  /**
   * Adds the specified stories to the story map, which maps storyId to story instance
   * @param {Story[]} storiesToAdd
   */
  addStoriesToMap(storiesToAdd) {
    for (const story of storiesToAdd) {
      this.storyMap[story.storyId] = story;
    }
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }


  async getStoriesInfiniteScroll(skip = this.stories.length, limit = 25) {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
      params: {
        skip,
        limit,
      }
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    for (const story of stories) {
      this.stories.push(story);
      this.storyMap[story.storyId] = story;
    }

    return stories;
  }


  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory(user, { title, author, url }) {
    const options = {
      method: 'POST',
      baseURL: BASE_URL,
      url: '/stories',
      headers: { 'Content-Type': 'application/json' },
      data: {
        token: user.loginToken,
        story: {
          title, author, url
        },
      }
    };
    try {
      const response = await axios.request(options);
      const newStory = new Story(response.data.story);
      storyList.stories.unshift(newStory);
      this.storyMap[newStory.storyId] = newStory;

      return newStory;
    }
    catch (error) {
      if (error.response === undefined) throw new ServerUnreachableError("Server can't be reached.");
      const err = error.response.data.error;
      switch (err.status) {
        case 400: throw new BadURLError("Please input valid URL.");
        case 401: throw new NotAuthenticatedError("Please refresh and login again.");
      }
      throw new Error(`Error: ${err.message}`);
    }
  }


  /**
   * Gets a story from local storage by id
   */
  getStoryById(storyId) {
    return this.storyMap[storyId];
  }

  /**
   * Returns true iff the story represented by the storyId is a favorite
   */
  isFavoriteStory(user, storyId) {
    return user.favorites.some((curStory) => curStory.storyId === storyId);
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }


  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: "POST",
        data: { user: { username, password, name } },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        response.data.token
      );
    } catch (error) {
      console.log("error=", error);
      if (error.response === undefined) throw new ServerUnreachableError("Server can't be reached.");
      const err = error.response.data.error;
      switch (err.status) {
        case 409: throw new UserAlreadyExistsError("Username already in use.");
      }
      throw new Error(`Error: ${err.message}`);
    }

  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {

    try {
      const response = await axios({
        url: `${BASE_URL}/login`,
        method: "POST",
        data: { user: { username, password } },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        response.data.token
      );
    } catch (error) {
      console.log("error=", error);
      if (error.response === undefined) throw new ServerUnreachableError("Server can't be reached.");
      const err = error.response.data.error;
      switch (err.status) {
        case 401: throw new IncorrectCredentialsError("Your username or password is incorrect.");
      }
      throw new Error(`Error: ${err.message}`);
    }
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  /**
   * Favorites a story by POST request to the server and adds the story
   * to the favorites array
   * @param {Story} story the story to favorite
   */
  async addFavorite(story) {
    const options = {
      method: 'POST',
      baseURL: BASE_URL,
      url: `/users/${this.username}/favorites/${story.storyId}`,
      headers: { 'Content-Type': 'application/json' },
      data: {
        token: this.loginToken,
      },
    };

    await axios.request(options);
    this.favorites.push(story);
  }

  /**
   * Removes a story by DELETE request to the server, and removes the story
   * from the favorites array
   * @param {Story} story the story to unfavorite
   */
  async removeFavorite(story) {
    const options = {
      method: 'DELETE',
      baseURL: BASE_URL,
      url: `/users/${this.username}/favorites/${story.storyId}`,
      headers: { 'Content-Type': 'application/json' },
      data: {
        token: this.loginToken,
      },
    };

    await axios.request(options);

    const storyIndex = this.favorites.indexOf(story);
    this.favorites.splice(storyIndex, 1);
  }
}
