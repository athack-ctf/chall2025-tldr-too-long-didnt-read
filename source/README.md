# Running This Challenge

- This chall consists of a node express app implemented in [./tldr-app](./tldr-app).
- The script [tldr-scripts/add-credentials.js](./tldr-scripts/add-credentials.js)
  generates [tldr-app/src/data/credentials.json](./tldr-app/src/data/credentials.json)
  form [tldr-scripts/data/accounts.json](./tldr-scripts/data/accounts.json). Make sure to run it if accounts.json is
  changed.

## Run [tldr-app](./tldr-app/) using docker

Build
```
docker build -t athack-ctf/chall2025-tldr-too-long-didnt-read:latest .
```

Run
```
docker run -d --name tldr-too-long-didnt-read \
  -p 52048:2025 \
  --memory 300m \
  --cpus 0.12 \
  athack-ctf/chall2025-tldr-too-long-didnt-read:latest

```
