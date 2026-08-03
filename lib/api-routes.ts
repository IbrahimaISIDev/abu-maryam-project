/**
 * Point d'entrée unique pour tous les chemins d'API internes appelés depuis
 * le client (admin + formulaire public). Si l'API venait un jour à vivre sur
 * une autre origine (sous-domaine dédié, versionnage, service séparé), seule
 * la variable d'environnement NEXT_PUBLIC_API_BASE_URL change — aucun appel
 * fetch() dans les composants n'a besoin d'être touché.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const apiRoutes = {
  inscription: () => `${API_BASE}/api/inscription`,

  adminLogin: () => `${API_BASE}/api/admin/login`,
  adminLogout: () => `${API_BASE}/api/admin/logout`,

  teachings: () => `${API_BASE}/api/admin/teachings`,
  teaching: (id: string) => `${API_BASE}/api/admin/teachings/${id}`,

  series: () => `${API_BASE}/api/admin/series`,
  seriesItem: (id: string) => `${API_BASE}/api/admin/series/${id}`,

  agenda: () => `${API_BASE}/api/admin/agenda`,
  agendaItem: (id: string) => `${API_BASE}/api/admin/agenda/${id}`,

  replays: () => `${API_BASE}/api/admin/replays`,
  replayItem: (id: string) => `${API_BASE}/api/admin/replays/${id}`,

  live: () => `${API_BASE}/api/admin/live`,
  seminar: () => `${API_BASE}/api/admin/seminar`,

  registration: (id: string) => `${API_BASE}/api/admin/registrations/${id}`,
  registrations: () => `${API_BASE}/api/admin/registrations`,

  youtubeResolve: () => `${API_BASE}/api/admin/youtube/resolve`,
  mediaPresign: () => `${API_BASE}/api/admin/media/presign`,

  adminProfile: () => `${API_BASE}/api/admin/profile`,
  adminPassword: () => `${API_BASE}/api/admin/password`,
  adminSettings: () => `${API_BASE}/api/admin/settings`,
} as const;
