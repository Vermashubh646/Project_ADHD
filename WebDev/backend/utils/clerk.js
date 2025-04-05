const { clerkClient } = require("@clerk/clerk-sdk-node");

async function getGoogleAccessToken(userId) {
  const tokens = await clerkClient.users.getUserOauthAccessToken(userId, "oauth_google");

  if (!tokens || tokens.length === 0) {
    throw new Error("No Google access token found for this user.");
  }

  const accessToken = tokens[0].token;
  return { token: accessToken };
}

module.exports = { getGoogleAccessToken };
