document.addEventListener('DOMContentLoaded', function() {
  const enabledCheckbox = document.getElementById('enabled');
  const dnsServerInput = document.getElementById('dnsServer');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.local.get(['enabled', 'dnsServer'], function(result) {
    enabledCheckbox.checked = result.enabled !== undefined ? result.enabled : true;
    dnsServerInput.value = result.dnsServer || 'http://localhost:8000/dns';
    updateStatus();
  });

  // Save settings when changed
  enabledCheckbox.addEventListener('change', function() {
    chrome.storage.local.set({
      enabled: enabledCheckbox.checked
    }, function() {
      updateStatus();
    });
  });

  dnsServerInput.addEventListener('change', function() {
    chrome.storage.local.set({
      dnsServer: dnsServerInput.value
    }, function() {
      updateStatus();
    });
  });

  function updateStatus() {
    statusDiv.textContent = enabledCheckbox.checked ? 
      'DNS redirection is enabled' : 
      'DNS redirection is disabled';
    statusDiv.className = 'status ' + (enabledCheckbox.checked ? 'enabled' : 'disabled');
  }
});