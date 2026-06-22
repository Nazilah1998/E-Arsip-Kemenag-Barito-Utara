import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'E-Arsip Kemenag Barito Utara',
    short_name: 'E-Arsip',
    description: 'Aplikasi Manajemen Arsip Digital Kementerian Agama Kabupaten Barito Utara',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc', // slate-50
    theme_color: '#059669', // emerald-600
    icons: [
      {
        src: '/kemenag-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/kemenag-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/kemenag.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
  }
}
