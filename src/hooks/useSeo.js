import { useEffect } from 'react';

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content || '');
};

export default function useSeo({ title, description, image, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) { setMeta('name', 'description', description); setMeta('property', 'og:description', description); }
    if (title) setMeta('property', 'og:title', title);
    if (image) setMeta('property', 'og:image', image);
    setMeta('property', 'og:type', jsonLd ? 'product' : 'website');
    let tag;
    if (jsonLd) { tag = document.createElement('script'); tag.type = 'application/ld+json'; tag.text = JSON.stringify(jsonLd); document.head.appendChild(tag); }
    return () => tag?.remove();
  }, [title, description, image, JSON.stringify(jsonLd)]); // eslint-disable-line
}
