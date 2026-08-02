import { createHmac, timingSafeEqual } from "crypto"
import { customAlphabet } from "nanoid"

// Layer 1 is the one identity layer the visitor owns outright - it is a localStorage value their own
// devtools can edit, and the server used to take whatever it sent as the `user_id` on a utm_stats
// row. Anyone could type `14-whatever` into localStorage and either invent visitors or write rows
// under someone else's id.
//
// So a deviceId is now `14-<body>-<check>`:
//
//   14-Xk29vBq7mTz4LpR8nWc1s-7QF3KMBH
//   ^^ ^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^
//   |  random body            check - the body run through an HMAC and folded onto CHECK_ALPHABET
//   prefix
//
// The mapping from body to check only runs one way: with the signing key you produce it in one
// step, without the key the only route is to try every combination - 32^8 of them. The server
// re-derives the check from the body it was handed and compares, so a hand-typed id is rejected and
// the visit falls through to the cookie/IP/fingerprint layers instead.
//
// This is a keyed check, not a character substitution table. A fixed table would be readable off a
// handful of real ids, and every visitor holds one of those in their own localStorage.

const DEVICE_ID_PREFIX = "14"

// No "-" in either alphabet, so splitting the id on "-" always yields exactly the 3 parts.
const BODY_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
const BODY_LENGTH = 21

// Crockford-style base32 - no I, L, O or U, so a check read aloud or copied by hand has no
// character pair anyone can confuse. 32 divides 256 exactly, so `byte % 32` picks each character
// with equal probability rather than favouring the first 8.
const CHECK_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const CHECK_LENGTH = 8

const createBody = customAlphabet(BODY_ALPHABET, BODY_LENGTH)

// Derived from the cookie key rather than a second env var, but through its own HMAC so the two
// uses never share raw key material - the cookie key encrypts, this one signs.
function getSigningKey() {
  const hexKey = process.env.DEVICE_ID_ENCRYPTION_KEY

  if (!hexKey || hexKey.length !== 64) {
    throw new Error("DEVICE_ID_ENCRYPTION_KEY must be set to a 32-byte hex string (64 hex chars)")
  }

  return createHmac("sha256", Buffer.from(hexKey, "hex")).update("device-id-signature").digest()
}

const signingKey = getSigningKey()

function checkFor(body: string) {
  const digest = createHmac("sha256", signingKey).update(body).digest()

  let check = ""
  for (let index = 0; index < CHECK_LENGTH; index++) {
    check += CHECK_ALPHABET[digest[index] % CHECK_ALPHABET.length]
  }
  return check
}

export function createDeviceId() {
  const body = createBody()
  return `${DEVICE_ID_PREFIX}-${body}-${checkFor(body)}`
}

// Every deviceId reaching the server goes through here first - the one from localStorage, the one
// decrypted out of the cookie, and the ones read back from Redis. The Redis and cookie values were
// written by this server, so they pass by construction; running them through anyway is what retires
// the older unsigned `14-<nanoid>` ids rather than letting them live on as valid forever.
export function isValidDeviceId(candidate: string | null | undefined): candidate is string {
  if (typeof candidate !== "string") return false

  const parts = candidate.split("-")
  if (parts.length !== 3) return false

  const [prefix, body, check] = parts
  if (prefix !== DEVICE_ID_PREFIX) return false
  if (body.length !== BODY_LENGTH || check.length !== CHECK_LENGTH) return false
  if (![...body].every(character => BODY_ALPHABET.includes(character))) return false

  // timingSafeEqual over equal-length buffers - a bare === returns as soon as two characters
  // differ, and that timing tells an attacker how many leading characters were right, which is
  // enough to rebuild a check one character at a time.
  const sent = Buffer.from(check)
  const expected = Buffer.from(checkFor(body))
  return sent.length === expected.length && timingSafeEqual(sent, expected)
}
