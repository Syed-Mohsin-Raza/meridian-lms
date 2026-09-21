import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export default function () {
  const res = http.get(`${BASE_URL}/actuator/health`);
  check(res, {
    'health is 200': (r) => r.status === 200,
    'health is UP': (r) => r.body.includes('"status":"UP"'),
  });
}