# File Conversion Guide for Origin SDK

## Origin SDK File Restrictions

Origin SDK only supports these file types:

| Type | Formats | Max Size |
|------|---------|----------|
| **Images** | JPEG, PNG, GIF, WebP | 10 MB |
| **Audio** | MP3, WAV, OGG | 15 MB |
| **Video** | MP4, WebM | 20 MB |
| **Text** | TXT | 10 MB |

**PDFs, Word documents, and ZIP files are NOT supported.**

## How to Convert Your Thesis

### Option 1: Convert PDF to Images (Recommended)

#### Online Tools (Free):
1. **PDF2PNG.com**
   - Upload your PDF
   - Download all pages as PNG images
   - Upload the first page or create a collage

2. **ILovePDF.com**
   - Go to "PDF to JPG"
   - Upload your PDF
   - Download images
   - Combine key pages if needed

3. **Smallpdf.com**
   - Select "PDF to JPG"
   - Upload and convert
   - Download images

#### Desktop Tools:
- **Adobe Acrobat**: File → Export To → Image → JPEG/PNG
- **Preview (Mac)**: File → Export → Format: PNG
- **GIMP (Free)**: Open PDF → Export as PNG

### Option 2: Convert PDF to Text

#### Online:
1. **PDFtoText.com**
   - Upload PDF
   - Download as TXT
   - Keep under 10MB

#### Desktop:
- **Adobe Acrobat**: File → Export To → Text
- **Preview (Mac)**: Select all text → Copy → Paste into TextEdit
- **pdftotext (Linux/Mac)**:
  ```bash
  pdftotext thesis.pdf thesis.txt
  ```

### Option 3: Create a Thesis Summary Image

If your thesis is too large, create a summary:

1. **Create a cover image** with:
   - Thesis title
   - Author name
   - University
   - Abstract (first 200 words)
   - Key findings
   - Link to full PDF (hosted elsewhere)

2. **Tools to create summary images:**
   - Canva.com (free templates)
   - PowerPoint/Keynote (export as PNG)
   - Photoshop/GIMP

### Option 4: Host PDF Elsewhere

Upload your full PDF to:
- Google Drive (get shareable link)
- Dropbox
- GitHub (if code-related)
- IPFS (via Pinata or NFT.Storage)

Then mint a summary image with the link in the description.

## For Source Code

### If you have a ZIP file:

1. **Extract the ZIP**
2. **Create a README.txt** with:
   - Project description
   - File structure
   - How to run
   - Link to full code repository

3. **Upload README.txt** (under 10MB)

### Or use GitHub:
1. Push code to GitHub
2. Create a text file with:
   - Repository URL
   - Installation instructions
   - Key files description

## For Demo Videos

### If video is too large (>20MB):

1. **Compress the video:**
   - **HandBrake** (free, desktop)
   - **CloudConvert.com** (online)
   - **FFmpeg** (command line):
     ```bash
     ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 1M output.mp4
     ```

2. **Reduce resolution:**
   - 1080p → 720p
   - 720p → 480p

3. **Shorten the video:**
   - Create a 2-3 minute highlight reel
   - Upload full video to YouTube/Vimeo
   - Include link in description

4. **Convert format:**
   - MOV → MP4 (usually smaller)
   - Use WebM format (better compression)

## Quick Conversion Commands

### PDF to Images (ImageMagick):
```bash
convert -density 150 thesis.pdf -quality 90 page-%03d.png
```

### PDF to Text:
```bash
pdftotext thesis.pdf thesis.txt
```

### Video Compression (FFmpeg):
```bash
# Compress to under 20MB
ffmpeg -i input.mp4 -vcodec h264 -crf 28 -preset fast output.mp4

# Convert to WebM
ffmpeg -i input.mp4 -c:v libvpx-vp9 -crf 30 -b:v 0 output.webm
```

### Image Compression:
```bash
# PNG to JPEG (smaller)
convert input.png -quality 85 output.jpg

# Resize image
convert input.jpg -resize 1920x1080 output.jpg
```

## Best Practices

### For Academic Theses:

1. **Create a cover page image** (PNG/JPG):
   - Title, author, university, year
   - Abstract
   - Key findings
   - QR code or link to full PDF

2. **Upload supplementary materials separately:**
   - Host full PDF on institutional repository
   - Code on GitHub
   - Data on Zenodo or Figshare

3. **Use metadata effectively:**
   - Put full abstract in description
   - Add keywords as attributes
   - Include supervisor wallet address
   - Link to external resources

### For Code Projects:

1. **Create a visual README:**
   - Screenshots as images
   - Architecture diagrams
   - Demo GIFs (convert to MP4)

2. **Link to repository:**
   - GitHub/GitLab URL in description
   - Include installation instructions
   - Add license information

### For Research Data:

1. **Create visualizations:**
   - Charts and graphs as PNG
   - Summary statistics as image
   - Key findings infographic

2. **Link to data repository:**
   - Zenodo, Figshare, OSF
   - Include DOI in description

## Workarounds for Large Files

### Multi-Part Upload:
1. Split thesis into chapters
2. Mint each chapter separately
3. Link them together using parent-child relationships

### External Hosting + NFT:
1. Upload full content to IPFS/Arweave
2. Mint a "pointer" NFT with:
   - Cover image
   - Description with IPFS CID
   - Metadata linking to full content

### Hybrid Approach:
1. Mint summary/preview (under size limits)
2. Include links to full content
3. Use NFT as proof of ownership
4. Full content hosted elsewhere

## Tools Summary

### Free Online Tools:
- **PDF Conversion**: ILovePDF, Smallpdf, PDF2PNG
- **Image Editing**: Photopea, Pixlr
- **Video Compression**: CloudConvert, Online-Convert
- **Image Compression**: TinyPNG, Compressor.io

### Free Desktop Tools:
- **PDF**: Adobe Reader, Preview (Mac), Okular (Linux)
- **Images**: GIMP, Paint.NET
- **Video**: HandBrake, VLC, FFmpeg
- **Text**: Any text editor

### Command Line (Advanced):
- **ImageMagick**: Image conversion
- **FFmpeg**: Video/audio processing
- **pdftotext**: PDF to text extraction
- **ghostscript**: PDF manipulation

## Need Help?

If you're stuck converting files:
1. Check file size: `ls -lh filename`
2. Check file type: `file filename`
3. Ask in Discord/support channels
4. Consider hiring a freelancer for bulk conversion

## Future Updates

We're working on:
- Supporting more file types
- Larger file size limits
- Direct PDF support
- Automatic conversion tools

Stay tuned for updates!
