#!/usr/bin/env node
// Run once: node scripts/gen-vapid.js
// Prints VAPID keys to add to .env
const webPush = require("web-push");
const keys = webPush.generateVAPIDKeys();
console.log("# Add to .env:");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
