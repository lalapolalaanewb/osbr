FROM node:20-alpine
# create dedicated app folder
RUN mkdir -p /usr/src/main
WORKDIR /usr/src/main
# copy everuthing except what's declared in .dockerignore file
COPY . .
# install project dependencies
RUN yarn
# build the project
RUN yarn run build
# run the app
CMD yarn start
# port expose
EXPOSE 3000