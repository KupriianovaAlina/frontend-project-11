const parseData = (data, link, type = 'load') => {
  const domParser = new DOMParser();
  const dataDOM = domParser.parseFromString(data.contents, 'application/xml');
  const errorNode = dataDOM.querySelector('parsererror');
  if (errorNode && type === 'load') throw new Error('noRSS');

  const title = dataDOM.querySelector('title');
  const description = dataDOM.querySelector('description');
  const feedId = _.uniqueId();

  const feedData = {
    title: title.textContent,
    description: description.textContent,
    link,
    feedId,
  };

  const posts = dataDOM.querySelectorAll('item');
  const postsData = [];
  posts.forEach((post) => {
    const title = post.querySelector('title');
    const description = post.querySelector('description');
    const link = post.querySelector('link');
    const postId = _.uniqueId();
    postsData.push({
      title: title.textContent,
      description: description.textContent,
      link: link.textContent,
      feedId,
      postId,
    });
  });

  return [feedData, postsData];
};

export default parseData;
