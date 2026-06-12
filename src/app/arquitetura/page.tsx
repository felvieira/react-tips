import type { Metadata } from 'next'
import { CockpitClient } from '@/components/arquitetura/CockpitClient'

export const metadata: Metadata = {
  title: 'System Design Cockpit',
  description: 'Cockpit interativo de System Design para entrevistas Frontend Senior e Staff. Conceitos de WebSocket, SSE, Offline-First, Virtualização e mais.',
}

export default function ArquiteturaPage() {
  return <CockpitClient />
}
