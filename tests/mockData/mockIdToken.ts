import { DecodedIdToken } from "firebase-admin/auth";

const mockIdToken: DecodedIdToken = {
  aud: "your-project-id",
  auth_time: Math.floor(Date.now() / 1000),
  email: "test@example.com",
  email_verified: true,
  exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  firebase: {
    identities: {
      "google.com": ["test@example.com"],
    },
    sign_in_provider: "google.com",
  },
  iat: Math.floor(Date.now() / 1000),
  iss: "https://securetoken.google.com/your-project-id",
  sub: "test-uid",
  uid: "test-uid",
};

export default mockIdToken