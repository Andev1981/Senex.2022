import React from "react";

const SurveyStatus = ({ status }) => {
    if (status === "pending") {
        return (
            <div className="w-full py-2 text-center bg-yellow-500">
                <span className="text-white uppercase">Pendiente</span>
            </div>
        );
    } else if (status === "in-progress") {
        return (
            <div className="w-full py-2 text-center bg-green-500">
                <span className="text-white uppercase">En Proceso</span>
            </div>
        );
    } else if (status === "finalized") {
        return (
            <div className="w-full py-2 text-center bg-primary">
                <span className="text-white uppercase">Finalizada</span>
            </div>
        );
    } else {
        return <div></div>;
    }
};

export default SurveyStatus;
