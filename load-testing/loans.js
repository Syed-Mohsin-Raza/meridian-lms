import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 30,
  duration: '60s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admin@lms.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@1234';

export function setup() {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  return { token: res.json('token') };
}

export default function (data) {
  const res = http.get(`${BASE_URL}/api/v1/loans/my`, {
    headers: { Authorization: `Bearer ${data.token}` },
  });

  check(res, {
    'loans list is 200': (r) => r.status === 200,
    'loans list is JSON': (r) => r.headers['Content-Type'].includes('json'),
  });

  sleep(1);
}