import bcrypt from "bcryptjs";

// Pour l'instant, on ne gère PAS encore les cookies/sessions.
// On se concentre sur le hashage de mot de passe + login/register qui renvoient du JSON.

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

// Type de payload pour plus tard (quand on fera les vraies sessions)
type SessionPayload = {
  userId: string;
  workspaceId?: string;
};

// Pour l'instant : ne fait rien, évite juste de casser le code
export function setSessionCookie(_payload: SessionPayload) {
  // TODO: implémenter une vraie session plus tard (cookies ou token)
  return;
}

export function clearSessionCookie() {
  // TODO: effacer la session plus tard
  return;
}

// Pour l'instant, aucune session côté serveur
export async function getCurrentUser() {
  return null;
}
