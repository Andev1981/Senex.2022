import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";

const CountdownTimer = ({ startDateTime, status }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isExpired, setIsExpired] = useState(false);
    const { get } = useForm();

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const endTime = new Date(startDateTime).getTime();
            const difference = endTime - now;

            if (difference <= 0) {
                setIsExpired(true);

                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor(
                    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                ),
                minutes: Math.floor(
                    (difference % (1000 * 60 * 60)) / (1000 * 60)
                ),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            };
        };

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [startDateTime]);

    useEffect(() => {
        const timer = setInterval(() => {
            get(route("/"));
        }, 50000);

        return () => clearInterval(timer);
    }, []);

    if (status === "pending") {
        return (
            <div className="bg-red-50">
                <div className="pt-4">
                    <p className="font-medium text-center text-yellow-500">
                        Votación no iniciada
                    </p>

                    <div className="pt-4">
                        <div>Comienza en</div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.days}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Días
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.hours}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Horas
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.minutes}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Minutos
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.seconds}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Segundos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full py-2 text-center bg-yellow-500">
                    <span className="text-white uppercase">Pendiente</span>
                </div>
            </div>
        );
    } else if (status === "in-progress") {
        return (
            <div className="bg-red-50">
                <div className="pt-4">
                    <p className="font-medium text-center text-green-600">
                        Votación en proceso
                    </p>

                    <div className="pt-4">
                        <div>Tiempo restante</div>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.days}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Días
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.hours}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Horas
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.minutes}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Minutos
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-2xl font-bold">
                                    {timeLeft.seconds}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Segundos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (status === finalized) {
        return (
            <div className="bg-red-50">
                <div className="pt-4">
                    <p className="font-medium text-center text-red-600">
                        Votación finalizada
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="pt-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2">
                        <div className="text-2xl font-bold">
                            {timeLeft.days}
                        </div>
                        <div className="text-xs text-gray-500">Días</div>
                    </div>
                    <div className="p-2">
                        <div className="text-2xl font-bold">
                            {timeLeft.hours}
                        </div>
                        <div className="text-xs text-gray-500">Horas</div>
                    </div>
                    <div className="p-2">
                        <div className="text-2xl font-bold">
                            {timeLeft.minutes}
                        </div>
                        <div className="text-xs text-gray-500">Minutos</div>
                    </div>
                    <div className="p-2">
                        <div className="text-2xl font-bold">
                            {timeLeft.seconds}
                        </div>
                        <div className="text-xs text-gray-500">Segundos</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
