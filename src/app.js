import i18next from 'i18next';
import { setLocale } from 'yup';
import view from './view.js';
import resources from './locales/index.js';
import { loadRSS, updateRSS } from './RSS_parser.js';

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
      notOneOf: () => i18nextInstance.t('errors.existedUrl'),
    },
    string: {
      url: () => i18nextInstance.t('errors.invalidUrl'),
    },
  }));

  const state = {
    lng: defaultLanguage,
    form: {
      valid: true,
      processState: 'filling',
      processError: null,
      error: null,
    },
    feeds: [],
    posts: [],
    viewedIds: [],
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
            watchedState.form.error = i18nextInstance.t('errors.requestErr');
          } else {
            watchedState.form.error = i18nextInstance.t('errors.invalidRSS');
          }
          watchedState.form.processState = 'failed';
        });
    } else {
      watchedState.form.processState = 'failed';
    }
  });
};

export default app;
