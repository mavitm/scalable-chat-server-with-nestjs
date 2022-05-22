# Pull node image from docker hub
FROM node:latest

# Set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

#create user with no password
# RUN adduser --disabled-password chat

# Copy existing application directory contents
COPY . .
# install and cache app dependencies
#COPY package.json /usr/src/app/package.json
#COPY package-lock.json /usr/src/app/package-lock.json

# grant a permission to the application
# RUN chown -R chat:chat /usr/src/app
# RUN chown -R chat:chat /usr/local/lib/node_modules

# USER chat

# clear application caching
RUN npm cache clean --force
# install all dependencies
RUN npm i -g @nestjs/cli
RUN npm install
RUN npm i @nestjs/core @nestjs/common rxjs reflect-metadata

EXPOSE 3000
CMD [ "npm", "run", "start:dev" ]