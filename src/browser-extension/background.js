// Configuration for the decentralized DNS
let config = {
  enabled: true,
  dnsServer: 'http://localhost:8000/dns', // Default DNS resolver endpoint
};

// Load configuration from storage
chrome.storage.local.get(['enabled', 'dnsServer'], function(result) {
  if (result.enabled !== undefined) config.enabled = result.enabled;
  if (result.dnsServer) config.dnsServer = result.dnsServer;
});

// Listen for changes in configuration
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.enabled) config.enabled = changes.enabled.newValue;
  if (changes.dnsServer) config.dnsServer = changes.dnsServer.newValue;
});

// Intercept and handle DNS requests
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (!config.enabled) return { cancel: false };

    const url = new URL(details.url);
    
    // Check if the domain needs to be resolved through decentralized DNS
    if (shouldUseDecentralizedDNS(url.hostname)) {
      return resolveDecentralizedDNS(url);
    }
    
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

async function shouldUseDecentralizedDNS(hostname) {
  // Check if the hostname should be resolved through decentralized DNS
  // This could check for specific TLDs or patterns
  return hostname.endsWith('.eth') || hostname.endsWith('.dcn');
}

async function resolveDecentralizedDNS(url) {
  try {
    const response = await fetch(`${config.dnsServer}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: url.hostname,
      }),
    });

    if (!response.ok) {
      throw new Error('DNS resolution failed');
    }

    const data = await response.json();
    
    if (data.ip) {
      // Redirect to the resolved IP while maintaining the original path and query
      const newUrl = new URL(url);
      newUrl.hostname = data.ip;
      return { redirectUrl: newUrl.toString() };
    }
  } catch (error) {
    console.error('Error resolving decentralized DNS:', error);
  }

  // If resolution fails, don't redirect
  return { cancel: false };
}