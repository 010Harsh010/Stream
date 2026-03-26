import http from 'k6/http';
import { sleep, check } from 'k6';
import { Trend } from 'k6/metrics';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<5'], // 95% of requests should be below 200ms
  },
  stages: [
    { duration: '10s', target: 10 },
    // { duration: '1m30s', target: 10 },
    // { duration: '20s', target: 0 },
  ],
};

const myTrend = new Trend('waiting_time')

// vu logics
export default function() {
  let res = http.get('http://localhost/api/health');
  myTrend.add(res.timings.waiting);
  check(res, { "status is 200": (res) => res.status === 200 });
  sleep(1);
}
