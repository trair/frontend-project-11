import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import { setLocale } from 'yup';
import view from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';

const app = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(setLocale({
      mixed: {
        notOneOf: 'errors.existedUrl',
      },
      string: {
        url: 'errors.invalidUrl',
      },
    }));

  const state = {
    lng: defaultLanguage,
    form: {
      valid: true,
      processState: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    viewedIds: new Set(),
    viewModal: null,
  };

  const watchedState = view(state, i18nextInstance);

  const validateLink = (url, feeds) => {
    const urls = feeds.map(({ link }) => link);

    const schema = yup.string().url().notOneOf(urls);

    try {
      schema.validateSync(url);
      return null;
    } catch (e) {
      return e.message;
    }
  };

  const generateURL = (url) => {
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

  const loadRSS = (link) => axios.get(generateURL(link))
    .then((response) => parse(response.data.contents))
    .then((parsedData) => addPostId(parsedData));

  const updateRSS = (link) => {
    const links = [];
    links.push(link);
    const promises = links.map(loadRSS);
    Promise.all(promises)
      .then((results) => {
        const loadedPosts = results.flatMap(({ posts }) => posts);
        const allPosts = _.union(loadedPosts, watchedState.posts);
        const newPosts = _.differenceBy(allPosts, watchedState.posts, 'link');

        if (newPosts.length > 0) {
          watchedState.posts = [...newPosts, ...watchedState.posts];
        }
      })
      .finally(() => {
        setTimeout(() => updateRSS(link), 5000);
      });
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const link = formData.get('url').trim();

    const error = validateLink(link, watchedState.feeds);
    watchedState.form.error = error;
    if (!error) {
      watchedState.form.processState = 'pending';

      loadRSS(link)
        .then((rss) => {
          const { feed, posts } = rss;
          watchedState.feeds.unshift(feed);
          watchedState.posts = [...posts, ...watchedState.posts];
          watchedState.form.processState = 'success';
          updateRSS(link);
        })
        .catch((err) => {
          if (err.isAxiosError) {
            watchedState.form.error = 'errors.requestErr';
          } else {
            watchedState.form.error = 'errors.invalidRSS';
          }
          watchedState.form.processState = 'failed';
        });
    } else {
      watchedState.form.processState = 'failed';
    }
  });
};

export default app;
