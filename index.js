const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { execFile } = require('child_process');
const youtubedl = require('youtube-dl-exec'); // wrapper that downloads yt-dlp binary
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({limit:'1mb'}));

// simple rate limiter
app.use(rateLimit({
  windowMs: 60*1000,
  max: 30
}));

// POST /api/download { url }
app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if(!url || typeof url !== 'string') return res.status(400).json({ error: 'URL tidak valid' });
  // basic block for internal URLs
  if(url.startsWith('http://127.') || url.startsWith('http://localhost') || url.startsWith('file://')){
    return res.status(400).json({ error: 'URL tidak diperbolehkan' });
  }

  try{
    // request metadata JSON from yt-dlp
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      // limit size of the output
      limitRate: '100M'
    });

    // pick best progressive format (has both audio+video)
    let videoUrl = null;
    if(Array.isArray(info.formats)){
      const prog = info.formats.find(f => f.acodec !== 'none' && f.vcodec !== 'none' && f.url);
      const any = info.formats.find(f => f.url);
      videoUrl = (prog && prog.url) || (any && any.url) || null;
    }
    const title = info.title || 'Video';
    const thumbnail = info.thumbnail || null;

    return res.json({ title, thumbnail, videoUrl });
  }catch(err){
    console.error('yt-dlp error:', err && err.stderr ? err.stderr : err.message || err);
    return res.status(500).json({ error: 'Gagal mengekstrak video. ' + (err.message||'') });
  }
});

// health
app.get('/health', (req,res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Backend listening on', PORT));
