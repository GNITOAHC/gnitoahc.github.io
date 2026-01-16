---
title: Fast Identity Online (FIDO)
date: 2025-02-01
description: Passwordless authentication with passkeys using FIDO2/WebAuthn.
readTime: 4 min read
tags: ['Backend', 'Security']
type: writing
---

# The End of the Password Era: Embracing a FIDO-Powered Future

Most of us have been there: staring at a login screen, frustrated because we forgot yet another “strong” password. Passwords are hard to remember, easy to reuse, and frequently end up stolen through phishing or data breaches.

A more user-friendly (and often more secure) alternative is **Fast Identity Online (FIDO)**—an industry standard that replaces passwords with **passkeys**.

Source video: [Fast Identity Online (FIDO) explained (YouTube)](https://www.youtube.com/watch?v=lRFeuSH9t44)

## What FIDO and Passkeys Actually Are

At a high level, FIDO authentication is built around **public-key cryptography**.

- Your device creates a **key pair**.
- The **private key** stays on your device.
- The server stores only the **public key**.

A **passkey** is essentially a FIDO credential used for signing in. It is typically protected by a local gesture such as Face ID / Touch ID, a device PIN, or a hardware security key.

Modern “passwordless on the web” implementations are often referred to as **FIDO2**, which commonly involves:

- **WebAuthn** (the browser API websites use)
- **CTAP2** (the protocol to talk to authenticators like security keys)

## The Cryptography Behind the Scenes (In Plain English)

There are two common categories of cryptography:

- **Symmetric cryptography** uses one shared secret key to encrypt and decrypt.
- **Asymmetric cryptography** uses a mathematically related **public key** and **private key**.

FIDO uses asymmetric cryptography so the server never needs to know your secret.

Importantly, authentication is done by **signing**, not “decrypting”:

- The server sends a one-time **challenge**.
- Your device uses the private key to **sign** that challenge.
- The server uses the public key to **verify** the signature.

## How the Flow Works

FIDO-based sign-in usually has two phases: **registration** and **authentication**.

### 1) Registration (Creating a Passkey)

When you create an account or add a passkey:

1. The server generates a registration request (includes a challenge and the website identity).
2. Your device/authenticator generates a new key pair for that website.
3. The device returns the **public key** (and related metadata) to the server.
4. The server stores the public key for future logins.

The private key stays on the device and is protected by the device’s secure storage. Your biometric data also stays on the device; it is used only to unlock the private key.

### 2) Authentication (Signing In)

When you sign in:

1. The server sends a one-time challenge.
2. You approve the login (biometric/PIN/security key).
3. The device signs the challenge with the private key.
4. The server verifies the response using the stored public key.

From the user’s perspective, it feels almost automatic: approve the prompt and you’re in.

## Why FIDO Is Usually More Secure

FIDO improves security by changing what an attacker can steal.

- Phishing resistance: a password can be typed into a fake website; a FIDO credential is bound to a legitimate website identity and can’t be “handed over” the same way.
- Replay resistance: each login uses a fresh challenge, so intercepted responses are not reusable.
- No shared secrets: the server stores public keys, not passwords. Even if the server database is leaked, attackers don’t get a password to crack.

This does not make systems invincible, but it removes several high-frequency failure modes that password-based logins suffer from.

## Practical Notes Before You Go All-In

A few things to plan for when adopting passkeys:

- Account recovery: decide what happens if a user loses all devices. Most systems need a recovery flow (backup methods, support processes, or multiple passkeys).
- Multi-device support: users often want to sign in from laptops and phones. Passkeys can work across devices, but the exact experience depends on platform and browser support.
- Step-up authentication: some actions (payments, admin operations) may still require a stronger check, even after login.

## Conclusion

FIDO moves authentication away from “secrets humans memorize” and toward “keys devices can protect.” The result is a sign-in experience that is often simpler for users and harder to steal at scale.

If you are building a modern authentication system, passkeys (via FIDO2/WebAuthn) are one of the most practical ways to go passwordless without sacrificing security.
