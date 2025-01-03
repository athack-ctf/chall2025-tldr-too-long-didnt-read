# How to solve TL;DR.?

## Solution
Authenticate with:
- **Username:** `broootheeer.meee.iii.duuupliiicaaateee.myyy.voooweeels.threee.tiiimeees`
- **Password:** `kaaaaaaaaaaaaaaa`

## How to derive these credentials
By analyzing the discussion in TL;DR.:
- Passwords must be lowercase alphanumerics and at least 16 characters long.
- The website hashes `username + password` using Bcrypt (instead of just the password).
- Bcrypt hashes only the first 72 bytes of input.
- The username has 71 characters, so only the first character of the password is hashed.
- To access the account, you only need to guess the first valid password character (which is a `k`).

## Real-world inspiration
This challenge is based on the [Okta bcrypt Security Incident](https://www.nodejs-security.com/blog/okta-bcrypt-security-incident-bun-nodejs).
