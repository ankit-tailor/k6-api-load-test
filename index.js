import { check, sleep } from "k6";

import http from "k6/http";

export const options = {
  stages: [
    { duration: "10s", target: 50 }, // Ramp up to 50 users
    { duration: "10s", target: 100 }, // Increase to 100 users
    { duration: "10s", target: 150 }, // Peak at 150 users
    { duration: "10s", target: 100 }, // Scale down to 100 users
    { duration: "10s", target: 50 }, // Reduce to 50 users
    { duration: "5s", target: 0 }, // Cool down to 0 users
  ],
  thresholds: {
    "http_req_duration{status:200}": ["p(95)<800"], // 95% of successful requests should be under 800ms
    "http_req_duration{status:500}": ["p(95)<5000"], // Server errors should not take too long
    http_req_failed: ["rate<0.1"], // Ensure failure rate stays below 10%
  },
};

export default function () {
  const res = http.get("");

  // ✅ Check HTTP status codes
  const is200 = check(res, {
    "✅ Status is 200 (Success)": (r) => r.status === 200,
  });
  check(res, {
    "⚠️ Status is 429 (Too Many Requests)": (r) => r.status === 429,
    "❌ Status is 500 (Server Error)": (r) => r.status === 500,
  });

  // ✅ Detailed response time tracking (only for successful requests)
  if (is200) {
    check(res, {
      "🚀 Response time < 200ms": (r) => r.timings.duration < 200,
      "🚀 Response time < 500ms": (r) => r.timings.duration < 500,
      "🚀 Response time < 700ms": (r) => r.timings.duration < 700,
      "⚠️ Response time < 800ms": (r) => r.timings.duration < 800,
      "⏳ Response time < 900ms": (r) => r.timings.duration < 900,
      "⏳ Response time < 1000ms": (r) => r.timings.duration < 1000,
    });
  }

  // ✅ Log failed requests for debugging
  if (res.status !== 200) {
    console.error(
      `⚠️ Request Failed - Status: ${res.status}, Duration: ${res.timings.duration}ms`
    );
  }

  sleep(1); // Simulate real user behavior
}
