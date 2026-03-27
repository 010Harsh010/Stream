import http from 'k6/http';
import { check } from 'k6';


export default function () {
  let res = http.get('http://ec2-3-110-253-35.ap-south-1.compute.amazonaws.com/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}