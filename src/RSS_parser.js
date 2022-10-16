export default (feedLink, data) => {
  try {
    const parser = new DOMParser();
    const parsedData = parser.parseFromString(data, 'text/xml');
    const parseError = parsedData.querySelector('parsererror');
    if (parseError) {
      throw new Error(parseError.textContent);
    }
    const result = {
      feed: null,
      posts: [],
    };

    const feedTitle = parsedData.querySelector('title').textContent;
    const feedDescription = parsedData.querySelector('description').textContent;

    const posts = parsedData.querySelectorAll('item');
    posts.forEach((post) => {
      const postTitle = post.querySelector('title').textContent;
      const postDescription = post.querySelector('description').textContent;
      const postLink = post.querySelector('link').textContent;

      const postData = {
        title: postTitle,
        description: postDescription,
        link: postLink,
      };
      result.posts.push(postData);
    });

    result.feed = {
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
    };
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
};
