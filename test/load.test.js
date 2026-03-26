import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(99)<100'], // 95% of requests should be below 200ms
  },
  stages: [
    { duration: '30s', target: 200 },
    { duration: '1m30s', target: 200 },
    { duration: '20s', target: 0 },
  ],
};

export default function() {
  let res = http.get('http://localhost/api/health');
    check(res, { "status is 200": (res) => res.status === 200 });
    // sleep(1);
}
