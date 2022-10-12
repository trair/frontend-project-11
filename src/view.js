import onChange from 'on-change';

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
  
  const renderPosts = (posts, i18nextInstance) => {
    const postsContainer = document.querySelector('.posts');
    postsContainer.innerHTML = `<h2>${i18nextInstance.t('posts')}</h2>`;
  
    const ul = document.createElement('ul');
    ul.classList.add('list-group');
  
    posts.forEach((post) => {
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
  
      const postTitle = document.createElement('a');
      postTitle.dataset.id = post.id;
      postTitle.textContent = post.title;
      postTitle.setAttribute('href', post.url);
      postTitle.classList.add('font-weight-normal');
  
      const postViewButton = document.createElement('button');
      postViewButton.textContent = i18nextInstance.t('buttons.view');
      postViewButton.setAttribute('type', 'button');
      postViewButton.classList.add('btn', 'btn-primary', 'btn-sm');
  
      li.append(postTitle, postViewButton);
      ul.append(li);
    });
    postsContainer.append(ul);
  };

export default (state, i18nextInstance) => {
    const input = document.querySelector('#url-input');
    const feedback = document.querySelector('.feedback');
    const form = document.querySelector('.rss-form');

    const watchedState = onChange(state, (path, value) => {
        if (path === 'form.processState') {
            switch (value) {
                case 'pending':
                    console.log('pending');
                    break;
                case 'failed':
                    console.log('failed');
                    feedback.textContent = state.form.error;
                    input.classList.add('is-invalid');
                    feedback.classList.add('text-danger');
                    break;
                case 'success':
                    console.log('success');
                    form.reset();
                    input.focus();
                    feedback.textContent = '';
                    input.classList.remove('is-invalid');
                    feedback.classList.remove('text-danger');
                    break;
                default:
                    throw new Error(`Unexpected process state: ${value}`);
            }
        } else if (watchedState.feeds.length > 0) {
            renderFeeds(watchedState.feeds, i18nextInstance);
            renderPosts(watchedState.posts, i18nextInstance);
        }
    });

    return watchedState;
};

