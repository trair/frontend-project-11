import _ from 'lodash';
import axios from 'axios';

export const parserRSS = (feedLink, data) => {
  try {
    const parser = new DOMParser();
    const parsedData = parser.parseFromString(data, 'text/xml');

    const result = {
      feed: null,
      posts: [],
    };

    const feedTitle = parsedData.querySelector('title').textContent;
    const feedDescription = parsedData.querySelector('description').textContent;
    const feedId = _.uniqueId();

    const posts = parsedData.querySelectorAll('item');
    posts.forEach((post) => {
      const postTitle = post.querySelector('title').textContent;
      const postDescription = post.querySelector('description').textContent;
      const postLink = post.querySelector('link').textContent;
      const postId = _.uniqueId();

      const postData = {
        id: postId,
        title: postTitle,
        description: postDescription,
        link: postLink,
      };
      result.posts.push(postData);
    });

    result.feed = {
      id: feedId,
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
    };
        
    return result;
  } catch {
    console.log(e);
    return null;
  }
};

const allOrigin = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', true);
  return result.toString();
};

export const loadRSS = (link) => axios.get(allOrigin(link))
.then((response) => parserRSS(link, response.data.contents));

const links = [];

const update = (state) => {
  const promises = link.map(loadRSS);
  Promise.all(promises)
    .them((result) => {
      const loadedPosts = result.flatMap(({ posts }) => posts);
      const allPosts = _.union(loadedPost, state.posts);
      const newPosts = _.differenceBy(all.Posts, state.posts, 'url');

      if (newPosts.length > 0) {
        state.posts = [...newPosts, state.posts];
      }
    })
    .finally(() => {
      setTimeout(() => updateRSS(state), 5000);
    });
};

export const updateRSS = (link, state) => {
  links.push(link);

  setTimeout(() => update(state), 5000);
};