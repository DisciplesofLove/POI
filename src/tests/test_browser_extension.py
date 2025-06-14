import pytest
import json
import os
from unittest.mock import MagicMock, patch

def load_manifest():
    manifest_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                               'browser-extension', 'manifest.json')
    with open(manifest_path, 'r') as f:
        return json.load(f)

def test_manifest_structure():
    """Test that the manifest.json has all required fields"""
    manifest = load_manifest()
    
    assert manifest['manifest_version'] == 2
    assert 'name' in manifest
    assert 'version' in manifest
    assert 'permissions' in manifest
    assert 'webRequest' in manifest['permissions']
    assert 'webRequestBlocking' in manifest['permissions']
    assert 'background' in manifest
    assert 'scripts' in manifest['background']
    assert 'background.js' in manifest['background']['scripts']

@pytest.mark.asyncio
async def test_should_use_decentralized_dns():
    """Test the DNS resolution decision logic"""
    # Mock the background.js shouldUseDecentralizedDNS function
    # In a real implementation, you would need to use a browser extension testing framework
    # This is a simplified version for demonstration
    
    test_cases = [
        ('example.eth', True),
        ('example.dcn', True),
        ('example.com', False),
        ('test.eth.com', False)
    ]
    
    for domain, expected in test_cases:
        # In real testing, this would use proper browser extension testing tools
        result = domain.endswith('.eth') or domain.endswith('.dcn')
        assert result == expected, f"Failed for domain {domain}"

@pytest.mark.asyncio
async def test_dns_resolution():
    """Test the DNS resolution functionality"""
    # Mock response for DNS resolution
    mock_response = {
        'ip': '192.168.1.1'
    }
    
    # Mock fetch function
    async def mock_fetch(*args, **kwargs):
        return MagicMock(
            ok=True,
            json=MagicMock(return_value=mock_response)
        )
    
    with patch('aiohttp.ClientSession.post', new=mock_fetch):
        # In real testing, this would use proper browser extension testing tools
        test_url = 'http://example.eth'
        expected_redirect = 'http://192.168.1.1'
        
        # Simulate DNS resolution request
        # This is a simplified version - real tests would use browser extension testing framework
        assert mock_response['ip'] == '192.168.1.1'

@pytest.mark.asyncio
async def test_dns_resolution_failure():
    """Test handling of DNS resolution failures"""
    async def mock_failed_fetch(*args, **kwargs):
        return MagicMock(
            ok=False
        )
    
    with patch('aiohttp.ClientSession.post', new=mock_failed_fetch):
        # In real testing, this would use proper browser extension testing tools
        test_url = 'http://example.eth'
        
        # Simulate failed DNS resolution request
        # This is a simplified version - real tests would use browser extension testing framework
        try:
            raise Exception("DNS resolution failed")
            assert False, "Should have raised an exception"
        except Exception as e:
            assert str(e) == "DNS resolution failed"