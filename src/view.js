import onChange from 'on-change';
import { handleCloseModal, handleViewPost } from './handlers.js';

const renderFeeds = (feeds, i18nextInstance) => {
  const feedsContainer = document.querySelector('.feeds');
  feedsContainer.innerHTML = `<h2>${i18nextInstance.t('feeds')}</h2>`;

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');

  feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.dataset.id = feed.id;

    const feedTitle = document.createElement('h3');
    feedTitle.textContent = feed.title;
    const feedDescription = document.createElement('p');
    feedDescription.textContent = feed.description;

    li.append(feedTitle, feedDescription);
    ul.append(li);
  });
  feedsContainer.append(ul);
};

const renderPosts = (state, posts, viewPostHandler, i18nextInstance) => {
  const postsContainer = document.querySelector('.posts');
  postsContainer.innerHTML = `<h2>${i18nextInstance.t('posts')}</h2>`;

  const ul = document.createElement('ul');
  ul.classList.add('list-group');

  posts.forEach((post) => {
    const isViewed = state.viewedIds.includes(post.id);

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const postTitle = document.createElement('a');
    postTitle.dataset.id = post.id;
    postTitle.textContent = post.title;
    postTitle.setAttribute('href', post.link);
    postTitle.setAttribute('target', '_blank');
    postTitle.classList.add(isViewed ? ('fw-normal', 'link-secondary') : 'fw-bold');

    const postViewButton = document.createElement('button');
    postViewButton.textContent = i18nextInstance.t('buttons.view');
    postViewButton.setAttribute('type', 'button');
    postViewButton.classList.add('btn', 'btn-primary', 'btn-sm');

    postTitle.addEventListener('click', () => {
      if (!state.viewedIds.includes(post.id)) {
        state.viewedIds.push(post.id)
      }
    });

    postViewButton.addEventListener('click', () => viewPostHandler(post,state));

    li.append(postTitle, postViewButton);
    ul.append(li);
  });
  postsContainer.append(ul);
};

const renderModal = (state, closeModalHandler, i18nextInstance) => {
  const { title, description, link } = state.posts.find((post) => post.id === state.activePostId);


  const fullArticleButton = document.querySelector('.full-article');
  fullArticleButton.textContent = i18nextInstance.t('buttons.readArticle');

  document.body.classList.add('modal-open');
  document.querySelector('.modal-title').textContent = title;
  document.querySelector('.modal-body').innerHTML = description;
  document.querySelector('.full-article').href = link;

  const substrate = document.createElement('div');
  substrate.classList.add('modal-backdrop', 'fade', 'show');
  document.body.append(substrate);

  const modal = document.querySelector('#modal');
  modal.classList.add('show');
  modal.getElementsByClassName.display = 'block';
  modal.setAttribute('role', 'dialog');
  modal.removeAttribute('aria-hidden');
  modal.setAttribute('aria-modal', 'true');

  const closeButtons = document.querySelectorAll('[data-bs-dismiss="modal"]');
  closeButtons[1].textContent = i18nextInstance.t('buttons.close');

  closeButtons.forEach((closeButton) => {
    closeButton.addEventListener('click', () => closeModalHandler(state));
  });
};

const renderModalClosed = () => {
  document.body.classList.remove('modal-open');

  const substrate = document.querySelector('.modal-backdrop');
  substrate.remove();

  const modal = document.querySelector('#modal');
  modal.classList.remove('show');
  modal.getElementsByClassName.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('role', 'aria-modal');
};

const render = (state, i18nextInstance) => {
  if (state.feeds.length > 0) {
    renderFeeds(state.feeds, i18nextInstance);
    renderPosts(state, state.posts, handleViewPost, i18nextInstance);
  }
};

const toggleForm = (status) => {
  const submitButton = document.querySelector('[type="submit"]');
  const input = document.querySelector('.form-control');

  submitButton.disable = status;
  input.readOnly = status;
};

const clearFeedback = () => {
  const input = document.querySelector('.form-control');
  const feedback = document.querySelector('.feedback');

  feedback.textContent = '';
  feedback.classList.remove('text-danger', 'text-success');
  input.classList.remove('is-invalid');
};

export default (state, i18nextInstance) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const form = document.querySelector('.rss-form');

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.processState') {
      switch (value) {
        case 'pending':
          toggleForm(true);
          clearFeedback();
          break;
        case 'failed':
          input.focus();
          toggleForm(false);
          break;
        case 'success':
          toggleForm(false);
          clearFeedback();
          form.reset();
          input.focus();
          feedback.textContent = i18nextInstance.t('success');
          feedback.classList.add('text-success');
          break;
        default:
          throw new Error(`Unexpected process state: ${value}`);
      }
    } else if (path === 'form.error') {
      feedback.textContent = '';
      if (value) {
        clearFeedback();
        input.classList.add('is-invalid');
        feedback.classList.add('text-danger');
        feedback.textContent = state.form.error;
      } else {
        clearFeedback();
      }
    } else if (path === 'activePostId') {
      if (value) {
        renderModal(watchedState, handleCloseModal, i18nextInstance);
      } else {
        renderModalClosed(watchedState);
      }
    } else if (path = 'posts') {
      renderPosts(watchedState, state.post, handleViewPost, i18nextInstance);
    } else if (path === 'feeds') {
      renderFeeds(state.feeds, i18nextInstance);
    } else {
      render(watchedState, i18nextInstance);
    }
  });

  return watchedState;
};
