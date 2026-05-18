#!/bin/bash
mkdir -p www
cp index.html www/
cp styles.css www/
cp stitches.js www/
cp manifest.json www/
cp sw.js www/
cp -r js www/
cp -r assets www/ 2>/dev/null || true
npx cap sync ios
