export function getPaddleApiHeaders(token: string) {
  const headers = new Headers()

  headers.append('Content-Type', 'application/json')
  headers.append('Accept', 'application/json')
  headers.append('Paddle-Clienttoken', token)

  return headers
}
