# Maps

This repository holds the code for the
[https://gamemaster.pixelastic.com/maps/][1] website. The website is generated
by [norska][2], with the [search-infinite][3] theme.

The data is crawled daily from reddit using [reddinx][4], then pushed to
[Algolia][5]. The code of that part is available on the [maps-data][6]
repository.

## Developping

Note to self: when working on this project, it can be helpful to run the
following commands:

- `yarn link norska-theme-search-infinite` in this repo
- `yarn link norska norska-css norska-frontend` in the
  `norska-theme-search-infinite` repo

[1]: https://gamemaster.pixelastic.com/maps/
[2]: https://projects.pixelastic.com/norska/
[3]: https://projects.pixelastic.com/norska/theme-search-infinite/
[4]: https://projects.pixelastic.com/reddinx/
[5]: https://www.algolia.com/
[6]: https://github.com/pixelastic/maps-data
