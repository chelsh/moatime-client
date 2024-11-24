"use client";

import MultiDatePicker from "@/components/calendar";
import callAPI from "@/lib/call-api";
import getToken from "@/lib/get-token";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreateEvent() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const fetchToken = async () => {
      const accessToken = await getToken();
      if (accessToken) {
        setToken(accessToken);
      } else {
        redirect("/login");
      }
    };

    fetchToken();
  }, []);

  return (
    <div className="h-full w-full flex items-center flex-col gap-8">
      <div className="w-full">
        <svg
          data-slot="icon"
          fill="none"
          strokeWidth={1.5}
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="mr-auto cursor-pointer size-12"
          onClick={() => {
            router.push("/board");
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </div>
      <div className="w-full px-12">
        <div className="text-3xl font-semibold">Create Event</div>
      </div>
      <div className="flex flex-col w-full h-4/5 pb-12 pt-6 px-12 rounded-lg bg-neutral-100 gap-6 min-w-fit">
        <div className="space-y-3">
          <div className="text-xl font-semibold">Title</div>
          <input
            type="text"
            value={title}
            className="w-1/2 py-1.5 px-2 rounded-lg"
            maxLength={50}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex-row flex gap-6">
          <div className="space-y-3">
            <div className="text-xl font-semibold">Select dates</div>
            <div className="flex justify-center bg-white rounded-lg px-4">
              <MultiDatePicker
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-xl font-semibold">Select times</div>
            <div className="w-72 h-48 bg-white rounded-lg pl-4 pr-12 py-3 space-y-2">
              <div className="text-lg font-semibold">No earlier than</div>
              <select
                className="w-28 py-1.5 rounded-lg border-2 cursor-pointer"
                onChange={(e) => setStartTime(e.target.selectedIndex)}
              >
                <option>12:00 AM</option>
                <option>1:00 AM</option>
                <option>2:00 AM</option>
                <option>3:00 AM</option>
                <option>4:00 AM</option>
                <option>5:00 AM</option>
                <option>6:00 AM</option>
                <option>7:00 AM</option>
                <option>8:00 AM</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>12:00 PM</option>
                <option>1:00 PM</option>
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>4:00 PM</option>
                <option>5:00 PM</option>
                <option>6:00 PM</option>
                <option>7:00 PM</option>
                <option>8:00 PM</option>
                <option>9:00 PM</option>
                <option>10:00 PM</option>
                <option>11:00 PM</option>
              </select>
              <div className="text-lg font-semibold">No later than</div>
              <select
                className="w-28 py-1.5 rounded-lg border-2 cursor-pointer"
                onChange={(e) => setEndTime(e.target.selectedIndex)}
              >
                <option>12:00 AM</option>
                <option>1:00 AM</option>
                <option>2:00 AM</option>
                <option>3:00 AM</option>
                <option>4:00 AM</option>
                <option>5:00 AM</option>
                <option>6:00 AM</option>
                <option>7:00 AM</option>
                <option>8:00 AM</option>
                <option>9:00 AM</option>
                <option>10:00 AM</option>
                <option>11:00 AM</option>
                <option>12:00 PM</option>
                <option>1:00 PM</option>
                <option>2:00 PM</option>
                <option>3:00 PM</option>
                <option>4:00 PM</option>
                <option>5:00 PM</option>
                <option>6:00 PM</option>
                <option>7:00 PM</option>
                <option>8:00 PM</option>
                <option>9:00 PM</option>
                <option>10:00 PM</option>
                <option>11:00 PM</option>
              </select>
            </div>
          </div>
        </div>
        <div className="w-full flex flex-row justify-between">
          <div className="*:text-red-600">
            {errors.map((error: string, idx) => (
              <div key={idx}>{error}</div>
            ))}
          </div>
          <button
            className="px-3 h-10 rounded-lg bg-neutral-300 font-semibold text-lg cursor-pointer"
            onClick={async () => {
              setErrors([]);
              if (!title) {
                setErrors((prev) => [
                  ...prev,
                  "The title must be at least one character.",
                ]);
              }
              if (selectedDates.length === 0) {
                setErrors((prev) => [
                  ...prev,
                  "You must select at least one date.",
                ]);
              }
              if (endTime === 0) setEndTime(24);
              if (startTime >= endTime) {
                if (endTime === 0) return;
                else {
                  setErrors((prev) => [
                    ...prev,
                    "StartTime must be earlier than endTime.",
                  ]);
                }
              }

              if (errors.length === 0) {
                const res = await callAPI({
                  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event`!,
                  method: "POST",
                  body: {
                    title,
                    dates: selectedDates,
                    startTime,
                    endTime,
                  },
                  isPrivate: true,
                  accessToken: token,
                });
                if (res.status === 201) {
                  router.push("/board");
                }
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
