const DEFAULT_WORKSPACE_ID = process.env.DEFAULT_WORKSPACE_ID;

if (!DEFAULT_WORKSPACE_ID) {
  // En dev, on préfère planter clairement si la config est manquante
  console.warn(
    "[RIVO] DEFAULT_WORKSPACE_ID n'est pas défini dans .env. Certaines pages pourront ne pas fonctionner.",
  );
}

export function getDefaultWorkspaceId() {
  if (!DEFAULT_WORKSPACE_ID) {
    throw new Error("DEFAULT_WORKSPACE_ID manquant dans .env");
  }
  return DEFAULT_WORKSPACE_ID;
}
