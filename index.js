import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";
import { obj } from "./attested-address.js";

export const options = {
  // Key configurations for Stress in this section
  stages: [
    { duration: "10s", target: 10000 }, // traffic ramp-up from 1 to a higher 200 users over 10 minutes.
    { duration: "5s", target: 10000 }, // stay at higher 200 users for 30 minutes
    { duration: "5s", target: 0 }, // ramp-down to 0 users
  ],
};

// const addresses = new SharedArray("addresses", function () {
//   return JSON.parse(open("./addresses.json"));
// });

export default () => {
  const attestedAddress = Object.values(obj);
  const randomIndex = Math.floor(Math.random() * attestedAddress.length);
  const address = attestedAddress[randomIndex];

  const urlRes = http.get(
    "https://backend.blockscratch.xyz/api/get-user?recipientAddress=" + address
  );
  check(urlRes, {
    "status is 200": (r) => r.status === 200,
    "response time < 200ms": (r) => r.timings.duration < 200,
  });
  check(urlRes, {
    "status 429": (r) => r.status === 429,
  });
  check(urlRes, {
    "status 500": (r) => r.status === 500,
  });
  sleep(1);
  // MORE STEPS
  // Here you can have more steps or complex script
  // Step1
  // Step2
  // etc.
};
