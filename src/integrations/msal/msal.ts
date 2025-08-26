import { PublicClientApplication, Configuration } from "@azure/msal-browser";

// MSAL configuration with runtime values from localStorage
const getAzureClientId = () =>
  localStorage.getItem("azure_client_id") || "YOUR_AZURE_AD_APP_CLIENT_ID";
const getAuthority = () => {
  const tenant = localStorage.getItem("azure_tenant_id");
  return tenant
    ? `https://login.microsoftonline.com/${tenant}`
    : "https://login.microsoftonline.com/common";
};
export const isMsalConfigured = () => getAzureClientId() !== "YOUR_AZURE_AD_APP_CLIENT_ID";

const msalConfig: Configuration = {
  auth: {
    clientId: getAzureClientId(),
    authority: getAuthority(),
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

// Initialize MSAL - call this function before using MSAL
export const initializeMsal = async () => {
  await msalInstance.initialize();
};