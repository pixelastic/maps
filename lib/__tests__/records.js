const current = require('../records.js');
const readJson = require('firost/lib/readJson');

describe('records', () => {
  describe('fromPost', () => {
    let fixture;
    beforeAll(async () => {
      fixture = await readJson('./lib/fixtures/posts/default.json');
    });
    it.each([
      ['id', 't3_ex2lw7'],
      [
        'title',
        'Mining city up against the mountains I created for my campaign.',
      ],
      [
        'url',
        'https://www.reddit.com/r/dndmaps/comments/ex2lw7/mining_city_up_against_the_mountains_i_created/',
      ],
      ['date', 1580570833],
      ['tags', ['City']],
      ['subreddit.name', 'dndmaps'],
      ['subreddit.id', 't5_3isai'],
      ['author.name', 'Jurtrazi'],
      ['author.id', 't2_2anmms39'],
      [
        'picture.thumbnail',
        'https://b.thumbs.redditmedia.com/FzWUmMZks1lPmna15lj3djwK_60T4AqgUCm7FuvbSNk.jpg',
      ],
      ['picture.full', 'https://i.redd.it/3cg1g2iok9e41.jpg'],
      [
        'picture.preview',
        'https://preview.redd.it/3cg1g2iok9e41.jpg?width=640&crop=smart&auto=webp&s=5f81639d4693950bf937ebc498abc19ea7b80352',
      ],
      ['score.ups', 52],
      ['score.downs', 0],
      ['score.ratio', 0.94],
      ['score.value', 52],
      ['score.comments', 5],
    ])('%s', async (key, expected) => {
      const actual = current.fromPost(fixture);
      expect(actual).toHaveProperty(key, expected);
    });
  });
});
