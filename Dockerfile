FROM node:12

ARG PORT=8080
ARG SESSION_SECRET=asoxuhxonnewhqxer
ARG DATABASE_URL=postgres://test:test@localhost:5432/maces
ARG MACES_USERNAME=test
ARG MACES_PASSWORD=test
ARG NODE_ENV=development

# Add add sudo support for non-root user
RUN apt-get update && apt-get install -y sudo
RUN echo node ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/node
RUN chmod 0440 /etc/sudoers.d/node

RUN mkdir /home/node/server && chown -R node:node /home/node/server

WORKDIR /home/node/server

USER node:node

ENV NODE_ENV=$NODE_ENV
ENV SESSION_SECRET=$SESSION_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV MACES_USERNAME=$MACES_USERNAME
ENV MACES_PASSWORD=$MACES_PASSWORD
ENV PORT=$PORT
EXPOSE $PORT

CMD [ "./bin/docker.sh" ]
