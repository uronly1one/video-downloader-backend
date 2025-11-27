# Backend for VidGrab — Deploy to Fly.io

This backend uses `youtube-dl-exec` (a Node wrapper) which bundles `yt-dlp` to extract metadata and direct video URLs.
It is designed to be deployed as a Docker container to Fly.io.

## Files in this folder
- index.js
- package.json
- Dockerfile
- .dockerignore

## Local test
1. Install deps:
   ```
   npm install
   ```
2. Run:
   ```
   node index.js
   ```
3. Test:
   ```
   curl -X POST http://localhost:3000/api/download -H "Content-Type: application/json" -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
   ```

## Deploy to Fly.io (step-by-step)

Prerequisite: have a GitHub account and Fly account. Install flyctl: https://fly.io/docs/flyctl/install/ citeturn0search1

1. Install flyctl and login:
   ```
   curl -L https://fly.io/install.sh | sh
   # then
   fly auth login
   ```

2. Initialize app (interactive) in project folder:
   ```
   fly launch
   ```
   Choose a unique app name (example: video-downloader-backend). When asked to deploy now, choose 'no' (we'll customize the Dockerfile).

   This creates a fly.toml. If you prefer non-interactive:
   ```
   fly launch --name video-downloader-backend --region iad --no-deploy
   ```

3. Build & deploy:
   ```
   fly deploy
   ```
   fly will build the Docker image and deploy.

Documentation: Fly supports deploying from Dockerfile and will detect/build accordingly. citeturn0search0turn0search4

## Notes
- The `youtube-dl-exec` package will auto-download `yt-dlp` binary at install time; ensure the build environment has Python available (the Dockerfile installs python3).
- Some platforms require adding additional libs; if you face errors related to missing libs, inspect container logs via `fly logs` and adjust Dockerfile.

## After deploy
- Your app will be available at `https://<appname>.fly.dev`
- Update frontend `API_BASE` in `script.js` to point to:
  ```
  https://<appname>.fly.dev/api/download
  ```
- Optional: set up a CORS policy or HTTPS domain via Fly docs.

Citations:
- Fly deploy from Dockerfile. citeturn0search0turn0search4
- Install flyctl. citeturn0search1
- youtube-dl-exec repo (wrapper for yt-dlp). citeturn0search2
