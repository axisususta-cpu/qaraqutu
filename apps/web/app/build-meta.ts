const commitSha =
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  "unknown";

const buildTime =
  process.env.NEXT_PUBLIC_BUILD_TIME ??
  process.env.BUILD_TIME ??
  new Date().toISOString();

export const webBuildMeta = {
  app: "qaraqutu-web",
  commitSha,
  buildTime,
};

