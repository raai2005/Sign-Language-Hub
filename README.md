# Sign Language Learning Website

A comprehensive web application for learning Indian Sign Language (ISL) through interactive videos and step-by-step instructions.

## Features

- **Interactive Learning**: Learn all 26 letters of the ISL alphabet with video demonstrations
- **Word Learning**: Master common words and phrases in sign language
- **Progress Tracking**: Monitor your learning progress
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful, accessible interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## Project Structure

```
/sign-language-app
├── /public
│   └── /videos         ← MP4 files or thumbnails
├── /pages
│   ├── index.tsx       ← Home page
│   ├── learn.tsx       ← Learn A–Z page
│   ├── about.tsx       ← Info page
│   └── api/
│       └── letters.ts  ← API route for letters
├── /components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Card.tsx        ← Reusable for letters/words
├── /styles
│   └── globals.css
├── /data
│   └── signs.json      ← Metadata for videos, descriptions
├── next.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sign-language-app
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Adding Content

### Videos

1. Place video files in `public/videos/`
2. Follow the naming convention:
   - Letters: `letter-a.mp4`, `letter-b.mp4`, etc.
   - Words: `word-hello.mp4`, `word-thank-you.mp4`, etc.

### Thumbnails

1. Create thumbnail images in `public/videos/thumbnails/`
2. Use the same naming convention as videos but with `.jpg` extension

### Data

Update `data/signs.json` to include:

- Letter metadata (A-Z)
- Word metadata with categories
- Video and thumbnail paths
- Descriptions for each sign

## API Endpoints

### GET /api/letters

Returns all letter data from `signs.json`

### POST /api/submit

Accepts quiz submissions with:

- Score and total questions
- Percentage
- Timestamp
- Individual answer details

## Customization

### Colors

Update the color scheme in `tailwind.config.js`:

```javascript
colors: {
  primary: '#3B82F6',
  secondary: '#1E40AF',
  accent: '#F59E0B',
}
```

### Content

- Modify `data/signs.json` to add/remove letters and words
- Update descriptions and video paths
- Add new categories for words

### Styling

- Edit `styles/globals.css` for custom styles
- Modify component files for layout changes

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Deploy automatically on push to main branch

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform that supports Node.js.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] User authentication and progress saving
- [ ] Advanced quiz types
- [ ] Community features
- [ ] Mobile app version
- [ ] Additional sign language support
- [ ] AI-powered sign recognition
