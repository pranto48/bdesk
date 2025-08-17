import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// MSAL configuration
const msalConfig: Configuration = {
  auth: {
    clientId: "YOUR_AZURE_AD_APP_CLIENT_ID", // Replace with your actual client ID
    authority: "https://login.microsoftonline.com/common", // Supports work/school and personal accounts
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage", // Store tokens in localStorage
    storeAuthStateInCookie: false,
  },
};

// Create the MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Request scopes for Microsoft Graph
export const loginRequest = {
  scopes: ["User.Read", "Files.Read", "offline_access"],
};

// Initialize MSAL
await msalInstance.initialize();