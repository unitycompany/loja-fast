#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const PUBLIC_DIR = path.join(ROOT, 'public')

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://loja.fastsistemasconstrutivos.com.br'
const BASE_PATH = process.env.BASE_PATH || '/'
const BASE_URL = new URL(BASE_PATH, SITE_ORIGIN).toString()

const robots = `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap.xml', BASE_URL).toString()}\n`

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true })
fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf-8')
console.log('[robots] Wrote public/robots.txt')

