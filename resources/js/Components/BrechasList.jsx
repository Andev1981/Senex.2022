import React from "react";

export default function BrechasList({ lists, type }) {
    return (
        <div>
            {lists?.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                    <h1 className="text-lg font-semibold">Brechas {type}</h1>
                    {lists?.map(
                        (revision) =>
                            revision?.brecha && (
                                <div
                                    key={revision.id}
                                    className="flex justify-between items-center bg-gray-100 p-2 rounded-lg shadow-sm"
                                >
                                    <div>
                                        <h1 className="text-sm font-semibold">
                                            {revision?.name}
                                        </h1>
                                        <span className="italic text-gray-500">
                                            {revision?.brecha?.brecha}
                                        </span>
                                    </div>
                                    <div>
                                        <span>
                                            {revision?.is_critical
                                                ? "Crítica"
                                                : ""}
                                        </span>
                                    </div>
                                </div>
                            ),
                    )}
                </div>
            )}
        </div>
    );
}
