import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(99)<200'], // 95% of requests should be below 200ms
  },
  stages: [
    { duration: '30s', target: 200 }, // ramp-up
    { duration: '30s', target: 200 }, // stable
    { duration: '1m', target: 800 }, // stable
    { duration: '1m', target: 1000 }, // stable
    { duration: '1m30s', target: 2000 }, // spike
    { duration: '20s', target: 0 }, // ramp down
  ],
};

export default function() {
  let res = http.get('http://localhost/api/health');
    check(res, { "status is 200": (res) => res.status === 200 });
    // sleep(1);
}
