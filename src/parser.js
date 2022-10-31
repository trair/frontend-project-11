const parseHTML = (data) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(data, 'text/xml');
  const parseError = parsedData.querySelector('parsererror');
  if (parseError) {
    throw new Error('errors.invalidRSS');
  }

  return parsedData;
};

const getFeed = (parsedData) => {
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;
  return { title, description };
};

const getPosts = (parsedData) => {
  const posts = parsedData.querySelectorAll('item');
  return posts.forEach((post) => {
    const title = post.querySelector('title').textContent;
    const description = post.querySelector('description').textContent;
    const link = post.querySelector('link').textContent;
    return { title, description, link };
  });
};

export default (data) => {
  const parsedData = parseHTML(data);
  return {
    feed: getFeed(parsedData),
    posts: getPosts(parsedData),
  };
};
