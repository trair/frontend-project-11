import _ from 'lodash';
import axios from 'axios';

export const parseRSS = (feedLink, data) => {
  try {
    const parser = new DOMParser();
    const parsedData = parser.parseFromString(data, 'text/xml');

    const parseError = parsedData.querySelector('parseerror');
    if (parseError) {
      throw new Error(parseError.textContent);
    }

    const result = {
      feed: null,
      posts: [],
    };

    const feedTitle = parsedData.querySelector('title').textContent;
    const feedDescription = parsedData.querySelector('description').textContent;

    const posts = parsedData.querySelectorAll('item');
    posts.forEach((post) => {
      const postTitle = post.querySelector('title').textContent;
      const postDescription = post.querySelector('description').textContent;
      const postLink = post.querySelector('link').textContent;

      const postData = {
        title: postTitle,
        description: postDescription,
        link: postLink,
      };
      result.posts.push(postData);
    });

    result.feed = {
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
    };

    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const update = (link) => {
  const links = [];
  links.push(link);
  const promises = state.map(loadRSS);
  Promise.all(promises)
    .them((result) => {
      const loadedPosts = result.flatMap(({ posts }) => posts);
      const allPosts = _.union(loadedPosts, watchedState.posts);
      const newPosts = _.differenceBy(allPosts, watchedState.posts, 'link');

      if (newPosts.length > 0) {
        watchedState.posts = [...newPosts, watchedState.posts];
      }
    })
    .finally(() => {
      setTimeout(() => updateRSS(link), 5000);
    });
};

const allOrigin = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', true);
  return result.toString();
};

const addPostId = (data) => {
  const postsWithId = data.posts.map((post) => ({
    id: _.uniqueId(),
    ...post,
  }));

  return { ...data, posts: postsWithId };
};

export const updateRSS = (link, state) => {
  const links = [];
  links.push(link);

  setTimeout(() => update(state, links), 5000);
};

export const loadRSS = (link) => axios.get(allOrigin(link))
  .then((response) => parseRSS(link, response.data.contents))
  .then((parcedData) => addPostId(parcedData));
