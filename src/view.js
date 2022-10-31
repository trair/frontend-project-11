import onChange from 'on-change';

export default (state, i18nInstance) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('[type="submit"]'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal a'),
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
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0');

      const isViewed = state.viewedIds.has(post.id);
      const postTitle = document.createElement('a');
      postTitle.classList.add(isViewed ? ('fw-normal', 'link-secondary') : 'fw-bold');
      postTitle.setAttribute('href', post.link);
      postTitle.setAttribute('target', '_blank');
      postTitle.setAttribute('rel', 'noopener noreferrer');

      postTitle.dataset.id = post.id;
      postTitle.textContent = post.title;

      const postViewButton = document.createElement('buttom');
      postViewButton.setAttribute('type', 'button');
      postViewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm', 'h-100');
      postViewButton.dataset.bsToggle = 'modal';
      postViewButton.dataset.bsTarget = '#modal';
      postViewButton.dataset.id = post.id;
      postViewButton.textContent = i18nInstance.t('buttons');
      li.append(postTitle, postViewButton);

      return li;
    });
    ul.append(...postsElements);
    card.append(ul);
    elements.posts.append(card);
  };

  const renderFeeds = () => {
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

    const feedElements = state.feeds.map((feed) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'border-0', 'border-end-0');

      const feedTitle = document.createElement('h3');
      feedTitle.classList.add('h6', 'm-0');
      feedTitle.textContent = feed.title;

      const feedDescription = document.createElement('p');
      feedDescription.classList.add('m-0', 'small', 'text-black-50');
      feedDescription.textContent = feed.description;
      li.append(feedTitle, feedDescription);

      return li;
    });
    ul.append(...feedElements);
    card.append(ul);
    elements.feeds.append(card);
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'viewModal') {
      const { title, description, link } = state.viewModal;
      elements.modalTitle.textContent = title;
      elements.modalBody.textContent = description;
      elements.modalLink.setAttribute('href', link);
      watchedState.state = 'loaded';
    }
    if (path === 'processState') {
      if (value === 'failed') {
        elements.input.focus();
        elements.input.classList.add('is-invalid');
        elements.submitButton.classList.remove('disabled');
        elements.feedback.textContent = i18nInstance.t(watchedState.error);
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        watchedState.state = 'rendered';
      }
      if (value === 'processing') {
        elements.feedback.textContent = '';
        elements.submitButton.classList.add('disabled');
        watchedState.error = '';
        watchedState.state = 'rendered';
      }
      if (value === 'processed') {
        elements.form.reset();
        elements.input.focus();
        elements.input.classList.remove('is-invalid');
        elements.submitButton.classList.remove('disabled');
        elements.feedback.textContent = i18nInstance.t('success');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        elements.posts.innerHTML = '';
        elements.feeds.innerHTML = '';
        renderPosts(watchedState, elements);
        renderFeeds(watchedState, elements);
        watchedState.state = 'rendered';
      }
    }
  });

  return watchedState;
};
