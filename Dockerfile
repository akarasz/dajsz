# build environment
FROM node:14 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts -g --silent
COPY . ./
RUN npm run build

# production environment
FROM nginx:1.19-alpine
COPY --from=build /app/build /usr/share/nginx/dajsz/
COPY privacy.html /usr/share/nginx/dajsz/privacy/
COPY support.html /usr/share/nginx/dajsz/support/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY scripts/30-globals.js.sh /docker-entrypoint.d/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

