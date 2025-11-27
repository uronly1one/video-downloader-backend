FROM node:18-slim

# install dependencies for yt-dlp and ffmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]
