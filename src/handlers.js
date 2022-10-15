import * as yup from 'yup';
import { parserRSS, loadRSS, updateRSS } from './RSS_parser.js';

const validateLink = (link, feeds) => {
    const urls = feeds.map(({ url }) => url);
    const schema = yup.string().url().notOneOf(urls);

    try {
        schema.validateSync(link);
        return null;
    } catch (e) {
        return e.message;
    };
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

export const handleViewPost = (post) => {
    document.body.classList.add('modal-open');
    document.querySelector('.modal-title').textContent = post.title;
    document.querySelector('.modal-body').innerHTML = post.description;
    document.querySelector('.full-article').href = post.url;
    
    const substrate = document.createElement('div');
    substrate.classList.add('modal-backdrop', 'fade', 'show');
    document.body.append(substrate);

    const modal = document.querySelector('#modal');
    modal.classList.add('show');
    modal.style.display = 'block';
    modal.setAttribute('role', 'dialog');
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
};

export const handleCloseModal = () => {
    document.body.classList.remove('modal-open');

    const substrate = document.querySelector('.modal-backdrop');
    substrate.remove();

    const modal = document.querySelector('#modal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('role', 'aria-modal');
};