import React, { useState } from "react";
import POS from "transbank-pos-sdk-web";

export default function Poll({ onPollResponse }) {
  const [waiting, setWaiting] = useState(false);

  const poll = () => {
    if (waiting) return;
    setWaiting(true);

    POS.poll()
      .then((response) => onPollResponse(response))
      .finally(() => setWaiting(false));
  };

  return (
    <div>
      <h2 className="text-xl">Poll</h2>

      <button
        onClick={poll}
        className="bg-green-600 hover:bg-green-700 px-5 py-2 shadow rounded text-white"
      >
        {!waiting ? "Realizar Poll" : "Haciendo Poll..."}
      </button>
    </div>
  );
}
