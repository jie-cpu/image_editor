'use client';

import dynamic from 'next/dynamic';

// This is a lightweight client component whose sole job is to dynamically
// import the heavy `ImageEditor` component with `ssr: false`. By keeping the
// dynamic call inside a client component we avoid Next.js build errors and we
// ensure that the Gemini API client is never evaluated on the server.
const ImageEditor = dynamic(() => import('./ImageEditor'), {
  ssr: false,
});

export default function ClientImageEditor() {
  return <ImageEditor />;
}
