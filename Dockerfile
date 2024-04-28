# Build
FROM node:21-alpine as build
WORKDIR /usr/app
COPY . /usr/app
RUN npm ci
RUN npm run build

# Run
FROM nginx:alpine
EXPOSE 80
COPY ./docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/app/dist /usr/share/nginx/html