---
order: 2
title: Scriptly
titleLines: ['Scriptly']
summary: A free, self-hostable YouTube transcript generator. Paste a link and get a clean, searchable, timestamped transcript.
kind: Tool
year: 2026
status: Open source
stack: ['JavaScript', 'Node.js', 'Express', 'yt-dlp', 'HTML', 'CSS', 'Docker', 'Render']
features:
  - Takes any YouTube URL format, from full links and youtu.be to Shorts, embeds and bare video ids.
  - Clickable timestamps that jump to the exact second on YouTube.
  - Live search across the transcript, with highlighting.
  - Plain text by default, timestamped on request.
  - Export as TXT, SRT, VTT or JSON.
  - Memory and disk caching, with rate limiting.
links:
  repo: https://github.com/deneal2005/scriptly
layout: wide
plate: scriptly
alt: A waveform in vermilion dots on black, turning into rows of pale transcript lines with one line highlighted.
detailAlt: Close-up of the transcript lines and the highlighted search result.
---

## What it is

Scriptly takes a YouTube link and returns the captions as a transcript you can actually use: plain text first, timestamps when you want them, search across all of it, and exports in the formats editors and subtitle tools expect.

## How it works

YouTube gates its caption endpoint behind an anti-bot token, so a plain HTTP request comes back empty. Scriptly drives *yt-dlp* to resolve fresh caption URLs and the video’s metadata, then downloads and parses the captions itself, falling back from json3 to srv1 to vtt until one works.

```
Browser → /api/transcript → yt-dlp → fetch + parse → JSON
```

## Speed

The first fetch of a new video takes about two seconds, because that token is the slow part. Every repeat lookup comes from a memory and disk cache in about a millisecond, transcripts are kept for seven days, and a few example videos are warmed up when the server starts.

## Running it in the cloud

From a datacenter IP, YouTube often answers with “Sign in to confirm you’re not a bot”. Scriptly reports that as a clear `503 blocked` error instead of a vague failure, and supports two ways around it through environment variables: a cookies file from a throwaway account, or a proxy.

## Known limits

It only reads captions that are already public, on demand, and stores nothing in a database. It isn’t affiliated with YouTube.

<!--
  Add your own sections here, for example:
  ## Why I built it
  ## What I learned
-->
