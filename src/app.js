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
      processState: 'intial',
      error: null,
    },
    links: [],
    feeds: [],
    posts: [],
    viewedIds: new Set(),
    viewModal: {},
  };

  const status = view(state, i18nextInstance);

  const generateURL = (url) => {
    const result = new URL('/get', 'https://allorigins.hexlet.app');
    result.searchParams.set('url', url);
    result.searchParams.set('disableCache', true);
    return result.toString();
  };

  const addPostId = (data) => {
    const feedId = _.uniqueId();
    const { title, description } = data.feed;
    const feed = { feedId, title, description };
    const posts = data.posts.map((post) => ({ feedId, id: _.uniqueId(), ...post }));
    return { feed, posts };
  };

  const loadRSS = (link) => axios.get(generateURL(link))
    .catch(() => {
      throw new Error('errors.requestErr');
    })
    .then((response) => {
      const parsedData = parse(response.data.contents);
      return addPostId(parsedData);
    })
    .catch((e) => {
      throw new Error(e.message);
    });

  const schema = yup.string().url().required();

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    if (!id) return;
    status.viewedIds.add(id);
    const { title, description, link } = status.posts.filter((item) => item.id === id)[0];
    status.viewModal = { title, description, link };
  });

  const updateRSS = () => {
    const promises = status.links
      .map((link, index) => loadRSS(link)
        .then((response) => {
          const { feedId } = status.feeds[index];
          const filteredPosts = status.posts.filter((post) => post.feedId === feedId);
          const currentNewPosts = _.differenceBy(response.posts, filteredPosts, 'title')
            .map((post) => ({ feedId, id: _.uniqueId, ...post }));
          if (currentNewPosts.length > 0) {
            status.posts.push(...currentNewPosts);
            status.processState = 'processed';
          }
        })
        .catch((err) => {
          status.error = err.message;
          status.processState = 'failed';
          throw new Error(err.message);
        }));
    Promise.all(promises).finally(() => setTimeout(updateRSS, 5000));
  };
  setTimeout(updateRSS, 5000);

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputURL = formData.get('url').trim();

    schema.notOneOf(status.links).validate(inputURL)
      .then(() => {
        status.processState = 'processing';
        return loadRSS(inputURL);
      })
      .then((normalizedData) => {
        status.feeds.push(normalizedData.feed);
        status.posts.push(...normalizedData.posts);
        status.links.push(inputURL);
        status.processState = 'processed';
      })
      .catch((err) => {
        status.error = err.message;
        status.processState = 'failed';
      });
  });
};

export default app;
