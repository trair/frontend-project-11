import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import view from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';

const addIds = (data) => {
  const feedId = _.uniqueId();
  const { title, description } = data.feed;
  const feed = { feedId, title, description };
  const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
  return { feed, posts };
};

const generateURL = (url) => {
  const result = new URL('/get', 'https://allorigins.hexlet.app');
  result.searchParams.set('url', url);
  result.searchParams.set('disableCache', true);
  return result.toString();
};

const getURL = (link) => axios.get(generateURL(link))
  .catch(() => {
    throw new Error('errors.requestErr');
  })
  .then((response) => {
    const parsedData = parse(response.data.contents);
    return addIds(parsedData);
  })
  .catch((e) => {
    throw new Error(e.message);
  });

export default () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    resources,
  });

  const state = {
    lng: defaultLanguage,
    processState: 'filling',
    error: '',
    links: [],
    feeds: [],
    posts: [],
    viewedIds: new Set(),
    viewModal: {},
  };

  const watchedState = view(state, i18nextInstance);

  yup.setLocale({
    mixed: {
      notOneOf: 'errors.existedUrl',
    },
    string: {
      url: 'errors.invalidUrl',
    },
  });

  const schema = yup.string().url().notOneOf();

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputURL = (e.target.elements.url.value).trim();

    schema.notOneOf(watchedState.links).validate(inputURL)
      .then(() => {
        watchedState.processState = 'processing';
        return getURL(inputURL);
      })
      .then((normalizedData) => {
        watchedState.feeds.unshift(normalizedData.feed);
        watchedState.posts.unshift(...normalizedData.posts);
        watchedState.links.unshift(inputURL);
        watchedState.processState = 'processed';
      })
      .catch((err) => {
        watchedState.error = err.message;
        watchedState.processState = 'failed';
      });
  });

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) return;
    watchedState.viewedIds.add(id);
    const { title, description, link } = watchedState.posts.filter((item) => item.id === id)[0];
    watchedState.viewModal = { title, description, link };
  });

  const checkNewPosts = () => {
    const promises = watchedState.links
      .map((link, index) => getURL(link)
        .then((response) => {
          const { feedId } = watchedState.feeds[index];
          const filteredPosts = watchedState.posts.filter((post) => post.feedId === feedId);
          const currentNewPosts = _.differenceBy(response.posts, filteredPosts, 'title')
            .map((post) => ({ feedId, id: _.uniqueId, ...post }));
          if (currentNewPosts.length > 0) {
            watchedState.posts.unshift(...currentNewPosts);
            watchedState.processState = 'processed';
          }
        })
        .catch((err) => {
          watchedState.error = err.message;
          watchedState.processState = 'failed';
          throw new Error(err.message);
        }));
    Promise.all(promises).finally(() => setTimeout(checkNewPosts, 5000));
  };
  setTimeout(checkNewPosts, 5000);
};
