import React from "react";

function QuestionsOptions({ options }) {
    const optionsString = JSON.parse(options).join(", ");
    return <div>{optionsString}</div>;
}

export default QuestionsOptions;
