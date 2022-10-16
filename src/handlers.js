import * as yup from 'yup';
import { parserRSS, loadRSS, updateRSS } from './RSS_parser.js';

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

export const handleAddLink = (e, state, i18nextInstance) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const link = formData.get('url').trim();

  const error = validateLink(link, state.feeds);
  state.form.error = error;

  if (!error) {
    state.form.proccessState = 'pending';

    loadRSS(link)
      .then((rss) => {
        const { feed, posts } = rss;
        state.feeds.unshift(feed);
        state.posts = [...posts, ...state.posts];
        state.form.proccessState = 'success';
        updateRSS(link, state);
      })
      .catch((err) => {
        if (err.isAxiosError) {
          state.form.error = i18nextInstance.t('errors.requestErr');
        } else {
          state.form.error = i18nextInstance.t('errors.invalidRSS');
        }
        state.form.proccessState = 'failed';
      });
  } else {
    state.form.proccessState = 'failed';
  }
};

export const handleViewPost = (post, state) => {
  state.activePostId = post.id;
  if (!state.viewedId.includes(post.id)) {
    state.viewedId.push(post.id);
  }
};

export const handleCloseModal = (state) => {
  state.activePostId = null;
};
