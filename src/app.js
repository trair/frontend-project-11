import i18next from 'i18next';
import { setLocale } from 'yup';
import { handleAddLink } from './handlers.js';
import view from './view.js';
import resources  from './locales/index.js';

const app = () => {
  const defaultLanguage = 'ru';
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources ,
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
  };

  const watchedState = view(state, i18nextInstance);

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    handleAddLink(e, watchedState, i18nextInstance);
  });
};

export default app;
