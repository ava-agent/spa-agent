#!/bin/bash
set -e

# Fix NativeWind CSS cache
mkdir -p node_modules/react-native-css-interop/.cache
touch node_modules/react-native-css-interop/.cache/web.css

# Export Expo web static files
npx expo export --platform web

# Bundle API function with all dependencies inlined (CJS format)
# This avoids ERR_REQUIRE_ESM from ESM-only packages (zod v4, jose v6)
npx esbuild api/index.ts --bundle --platform=node --format=cjs --outfile=/tmp/api-bundled.js

# Overwrite api/index.ts with the pre-bundled code
# Vercel's @vercel/node will process this without needing external ESM packages
cp /tmp/api-bundled.js api/index.ts
