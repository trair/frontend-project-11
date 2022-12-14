import onChange from 'on-change';

export default (state, i18nInstance) => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.modal a'),
  };

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
    elements.feeds.append(card);
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
      if (state.viewedIds.has(post.id)) {
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
      button.textContent = i18nInstance.t('buttons');
      li.append(postTitle, button);

      return li;
    });
    ul.append(...postsElements);
    card.append(ul);
    elements.posts.append(card);
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'viewModal') {
      const { title, description, link } = state.viewModal;
      elements.modalTitle.textContent = title;
      elements.modalBody.textContent = description;
      elements.modalLink.setAttribute('href', link);
      watchedState.processState = 'processed';
    }
    if (path === 'processState') {
      if (value === 'failed') {
        elements.input.focus();
        elements.input.classList.add('is-invalid');
        elements.button.classList.remove('disabled');
        elements.feedback.textContent = i18nInstance.t(watchedState.error);
        elements.feedback.classList.remove('text-success');
        elements.feedback.classList.add('text-danger');
        watchedState.processState = 'finished';
      }
      if (value === 'processing') {
        elements.feedback.textContent = '';
        elements.button.classList.add('disabled');
        watchedState.error = '';
        watchedState.processState = 'finished';
      }
      if (value === 'processed') {
        elements.form.reset();
        elements.input.focus();
        elements.input.classList.remove('is-invalid');
        elements.button.classList.remove('disabled');
        elements.feedback.textContent = i18nInstance.t('success');
        elements.feedback.classList.remove('text-danger');
        elements.feedback.classList.add('text-success');
        elements.posts.innerHTML = '';
        elements.feeds.innerHTML = '';
        renderPosts(watchedState, elements);
        renderFeeds(watchedState, elements);
        watchedState.processState = 'finished';
      }
    }
  });

  return watchedState;
};
