# Frontend Environment Configuration Setup

## Overview
The frontend has been updated with intelligent hostname-based logic to automatically determine the backend URL. This allows the application to work seamlessly in both local development and production environments.

## How It Works

### Environment Detection Logic
The system detects the environment based on the current hostname and protocol:

```javascript
const hostname = window.location.hostname;

const isLocalhost =
  hostname === "localhost" ||
  hostname.startsWith("127.") ||
  hostname.startsWith("192.168.") ||
  hostname === "::1" ||
  window.location.protocol === "file:";

const BACKEND_URL = isLocalhost
  ? "http://localhost:5050"
  : process.env.REACT_APP_BACKEND_URL || "https://travel-tales-f0hb.onrender.com";
```

### Detection Scenarios

#### Local Development (Automatically Uses `http://localhost:5050`)
- `localhost`
- `127.0.0.1`
- `127.x.x.x` (any loopback address)
- `192.168.x.x` (local network IPs)
- `::1` (IPv6 loopback)
- `file://` protocol (for local file testing)

#### Production/Remote (Uses Environment Variable or Fallback)
- Any other hostname will use `process.env.REACT_APP_BACKEND_URL`
- Falls back to `https://travel-tales-f0hb.onrender.com`

## Files Updated

### 1. **New Utility File: `frontend1/src/utils/environment.js`**
   - Creates reusable environment configuration
   - Exports `getBackendURL()` function
   - Exports `API_BASE_URL` constant for convenience
   - Can be imported in any component

### 2. **Updated Components**
All components now use the centralized environment configuration:

- ✅ `frontend1/src/admin/pages/AdminDashboard.js`
- ✅ `frontend1/src/admin/components/AdminTabs/DashboardTab.js`
- ✅ `frontend1/src/pages/CheckoutPage.js`
- ✅ `frontend1/src/pages/OrderDetailsPage.js`
- ✅ `frontend1/src/customer/pages/ProductsPage.js`
- ✅ `frontend1/src/customer/pages/ComparisonPage.js`
- ✅ `frontend1/src/customer/pages/CartWishlistPage.js`
- ✅ `frontend1/src/customer/pages/OrdersPage.js`
- ✅ `frontend1/src/customer/pages/ProductDetailsPage.js` (all 9 occurrences)

## Usage Examples

### Method 1: Using API_BASE_URL
```javascript
import { API_BASE_URL } from '../../utils/environment.js';

// API calls automatically use correct URL
fetch(`${API_BASE_URL}/products`);
```

### Method 2: Using getBackendURL Function
```javascript
import getBackendURL from '../../utils/environment.js';

const API_BASE = getBackendURL();
fetch(`${API_BASE}/api/products`);
```

## Environment Variable Configuration

### For Production Deployment
Set the environment variable in your `.env` file or deployment platform:

```bash
REACT_APP_BACKEND_URL=https://your-api-domain.com
```

### For Local Development
No configuration needed! It automatically detects localhost and uses `http://localhost:5050`

## Testing

### Local Testing (Automatic)
```bash
# Start frontend on localhost:3000
npm start

# Automatically uses http://localhost:5050
```

### Remote Testing
```bash
# Access via IP address or domain
# http://192.168.1.100:3000 → uses http://localhost:5050
# https://your-domain.com → uses REACT_APP_BACKEND_URL
```

### Different Network IPs
The application automatically detects and uses localhost for:
- Internal network IPs (192.168.x.x)
- Loopback addresses (127.x.x.x)
- IPv6 loopback (::1)

## Architecture Benefits

1. **Zero Configuration Development** - Works out of the box locally
2. **Flexible Deployment** - Works with any backend URL via environment variables
3. **Dynamic Detection** - No hardcoding needed for different environments
4. **Consistent Pattern** - Both frontend and backend now use similar logic
5. **Maintainability** - Single source of truth for all backend URLs
6. **Type Safety** - Clear exports and usage patterns

## Troubleshooting

### API calls still using old URL?
- Make sure to import from the new `utils/environment.js` file
- Check that all hardcoded URLs are replaced with `API_BASE_URL` or `getBackendURL()`
- Reload the page after making changes

### Production backend not responding?
- Verify `REACT_APP_BACKEND_URL` environment variable is set
- Check that the domain/IP is accessible from the client
- Ensure CORS is properly configured on the backend (should be enabled for all origins)

### Different behavior on different machines?
- The logic is based on hostname detection
- Local IPs (192.168.x.x) are detected as "localhost" for backend purposes
- This allows the same frontend code to work across different local network machines

## Quick Reference

| Access Point | Backend Used |
|---|---|
| `localhost:3000` | `http://localhost:5050` |
| `127.0.0.1:3000` | `http://localhost:5050` |
| `192.168.x.x:3000` | `http://localhost:5050` |
| `yourdomain.com:3000` | `REACT_APP_BACKEND_URL` or `https://travel-tales-f0hb.onrender.com` |

