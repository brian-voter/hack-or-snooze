"use strict";

const FAVORITED_HEART_ICON_CLASS = "fas fa-heart";
const NOT_FAVORITED_HEART_ICON_CLASS = "far fa-heart";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();

  storyList.addStoriesToMap(currentUser.favorites)
  storyList.addStoriesToMap(currentUser.ownStories);

  $storiesLoadingMsg.remove();

  putStoriesOnPage();

  $storiesSubContainer.on("click", ".heart", toggleFavorite);
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        <span class="heart">
          <i class="${getHeartClassForStory(story)}"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/**
 * Gets the CSS class for a story's favorite icon based on whether or not
 * the story has been favorited by the user
 * @param {Story} story
 * @returns {string} string CSS class
 */
function getHeartClassForStory(story) {
  return storyList.isFavoriteStory(currentUser, story.storyId) ? FAVORITED_HEART_ICON_CLASS
    : NOT_FAVORITED_HEART_ICON_CLASS;
}

/** For each story in the local list, generates its HTML, and puts it on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** For each story the user has favorited, generates its HTML, and puts it on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of our favorite stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }

  $favoriteStoriesList.show();
}

/**
 * This function is called when user submits add story form
 * Retrieves the values from the form, creates a story and adds it to storyList
 */
async function getFormDataAndAddStory() {
  const title = $("#title-input").val();
  const author = $("#author-input").val();
  const url = $("#url-input").val();

  const newStory = await storyList.addStory(currentUser, { title, author, url });
  const $story = generateStoryMarkup(newStory);
  $allStoriesList.prepend($story);
}

/**
 * Submit story when the user clicks the submit button
 */
async function onSubmitClick(evt) {
  console.debug("submit-story", evt);
  evt.preventDefault();
  await getFormDataAndAddStory();
  $addStoryForm.hide();
  $allStoriesList.show();
}

$addStoryForm.on("submit", onSubmitClick);

/**
 * Toggle a story's favorite status when a user clicks its heart icon
 * @param {*} evt
 */
async function toggleFavorite(evt) {
  const $iconElement = $(evt.target);
  console.debug("toggleFavorite", evt);
  const storyId = $iconElement.parent().parent().attr("id");
  console.debug("storyId", storyId);

  const story = storyList.getStoryById(storyId);

  if (currentUser.favorites.includes(story)) {
    await currentUser.removeFavorite(story);
    $iconElement.removeClass(FAVORITED_HEART_ICON_CLASS);
    $iconElement.addClass(NOT_FAVORITED_HEART_ICON_CLASS);
  } else {
    await currentUser.addFavorite(story);
    $iconElement.removeClass(NOT_FAVORITED_HEART_ICON_CLASS);
    $iconElement.addClass(FAVORITED_HEART_ICON_CLASS);
  }
}