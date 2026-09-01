import { validateContentToken } from '@skyemeta/skyegate';

// jose pulls in node-only crypto APIs; force the Node runtime instead of edge.
export const runtime = 'nodejs';

// Match what the browser sent to /api/verify so a JWT earned for one route
// can't be replayed against a different gate.
const EXPECTED_CONDITIONS = [
  {
    type: 'token_balance' as const,
    contractAddress: 'native',
    chainId: 1,
    threshold: '0.000001',
  },
];

export async function POST(req: Request) {
  let body: { jwt?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.jwt) {
    return Response.json({ error: 'Missing jwt' }, { status: 400 });
  }

  const result = await validateContentToken(body.jwt, {
    expectedConditions: EXPECTED_CONDITIONS,
  });

  if (!result.pass) {
    return Response.json({ error: result.error ?? 'Not authorized' }, { status: 403 });
  }

  return Response.json({
    secret:
      'You unlocked this server-side. The text was never in the page source or the JS bundle — your server fetched it from /api/gated-content after the signed JWT cleared validation.',
  });
}
