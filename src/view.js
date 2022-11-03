import onChange from 'on-change';

const renderFeeds = () => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');

  cardTitle.textContent = i18nInstance.t('feeds');
  cardBody.append(cardTitle);
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const feedsElements = state.feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3, p);

    return li;
  });
  ul.append(...feedsElements);
  card.append(ul);
  feedsContainer.append(card);
};

const renderPosts = () => {
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nInstance.t('posts');

  cardBody.append(cardTitle);
  card.append(cardBody);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const postsElements = state.posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'aling-items-start', 'border-0', 'border-end-0');
    const postTitle = document.createElement('a');
    if (state.readPostsIds.has(post.id)) {
      postTitle.classList.add('fw-normal');
    } else {
      postTitle.classList.add('fw-bold');
    }
    postTitle.setAttribute('href', post.link);
    postTitle.setAttribute('target', '_blank');
    postTitle.dataset.id = post.id;
    postTitle.textContent = post.title;
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'h-100');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.dataset.id = post.id;
    button.textContent = i18nInstance.t('postsButton');
    li.append(postTitle, button);

    return li;
  });
  ul.append(...postsElements);
  card.append(ul);
  postsContainer.append(card);
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
  modal.style.display = 'block';
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
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  modal.removeAttribute('role', 'aria-modal');
};

const render = (state, viewPostHandler, i18nextInstance) => {
  if (state.feeds.length > 0) {
    renderFeeds(state.feeds, i18nextInstance);
    renderPosts(state, state.posts, viewPostHandler, i18nextInstance);
  }
};

const renderFeedback = (state, status, i18nextInstance) => {
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const form = document.querySelector('.rss-form');
  const submitButton = document.querySelector('[type="submit"]');

  const clearFeedback = () => {
    feedback.textContent = '';
    feedback.classList.remove('text-danger', 'text-success');
    input.classList.remove('is-invalid');
  };

  const toggleForm = (value) => {
    submitButton.disabled = value;
    input.readOnly = value;
  };

  switch (status) {
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
    case 'error':
      clearFeedback();
      input.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = state.form.error;
      break;
    case 'clear':
      clearFeedback();
      break;
    default:
      throw new Error(`Unexpected process status: ${status}`);
  }
};

export default (state, i18nextInstance) => {
  const watchedState = onChange(state, (path, value) => {
    const handleViewPost = (post) => {
      watchedState.activePostId = post.id;
      if (!watchedState.viewedIds.has(post.id)) {
        watchedState.viewedIds.add(post.id);
      }
    };

    const handleCloseModal = () => {
      watchedState.activePostId = null;
    };
    if (path === 'form.processState') {
      if (value) {
        renderFeedback(state, value, i18nextInstance);
      } else {
        throw new Error(`Unexpected process state: ${value}`);
      }
    } else if (path === 'form.error') {
      if (value) {
        renderFeedback(state, 'error', i18nextInstance);
      } else {
        renderFeedback(state, 'clear', i18nextInstance);
      }
    } else if (path === 'activePostId') {
      if (value) {
        renderModal(state, handleCloseModal, i18nextInstance);
      } else {
        renderModalClosed(state);
      }
    } else if (path === 'posts') {
      renderPosts(state, state.posts, handleViewPost, i18nextInstance);
    } else if (path === 'feeds') {
      renderFeeds(state.feeds, i18nextInstance);
    } else {
      render(state, handleViewPost, i18nextInstance);
    }
  });
  return watchedState;
};
