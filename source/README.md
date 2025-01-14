# TL;DR. chall

- This chall consists of a node express app implemented in [./tldr-app](./tldr-app).
- The script [tldr-scripts/add-credentials.js](./tldr-scripts/add-credentials.js)
  generates [tldr-app/src/data/credentials.json](./tldr-app/src/data/credentials.json)
  form [tldr-scripts/data/accounts.json](./tldr-scripts/data/accounts.json). Make sure to run it if accounts.json is
  changed.

## Run [tldr-app](./tldr-app/) using docker-compose

```
docker compose up --build
```
