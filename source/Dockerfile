FROM node:18-slim

RUN useradd -ms /bin/bash chall

WORKDIR /chall/tldr-app
COPY tldr-app/ .
RUN npm install --production
RUN chown -R chall:chall /chall/tldr-app

# Switch to the non-root user
USER chall
EXPOSE 2025
CMD ["npm", "start"]
