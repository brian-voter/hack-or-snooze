"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navSubmit.show();
  $navFavorites.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Upon user click, show the add story form */
function navShowAddStoryFormClick(evt) {
  console.debug("navShowAddStoryFormClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $addStoryForm.trigger("reset");
  $addStoryForm.show();
}

$navSubmit.on("click", navShowAddStoryFormClick);

/** Upon user click, show the favorites "window" */
function navShowFavoritesClick(evt) {
  console.debug("navShowFavoritesClick", evt);
  evt.preventDefault();
  hidePageComponents();
  putFavoritesOnPage();
}

$navFavorites.on("click", navShowFavoritesClick);