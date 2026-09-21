import http from 'k6/http';
import { Counter } from 'k6/metrics';

const bcryptAttempts = new Counter('bcrypt_attempts');
const rateLimitHits = new Counter('rate_limit_hits');

export const options = {
    vus: 50,
    duration: '30s',
    thresholds: {
        'http_req_duration{status:429}': ['p(95)<100'],
        'rate_limit_hits': ['count>700'],
        // Each of 50 buckets allows ~5 requests through, plus rotation → ~250-350
        'bcrypt_attempts': ['count<400'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

export default function () {
    const res = http.post(
        `${BASE_URL}/api/v1/auth/login`,
        JSON.stringify({ email: 'x@x.com', password: 'wrong' }),
        {
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': `10.0.${__VU}.1`,
            },
        }
    );

    if (res.status === 429) {
        rateLimitHits.add(1);
    } else if (res.status === 400) {
        bcryptAttempts.add(1);
    }
}