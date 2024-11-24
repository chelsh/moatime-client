"use client";

import callAPI from "@/lib/call-api";
import getToken from "@/lib/get-token";
import { EventDetailData } from "@/lib/type/event-detail-data.type";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Event() {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string>("");
  const [eventDetail, setEventDetail] = useState<EventDetailData>();
  const [myId, setMyId] = useState<number>();
  const [times, setTimes] = useState<number[]>([]);
  const [email, setEmail] = useState<string>("");
  const [inviteError, setInviteError] = useState<string>("");

  useEffect(() => {
    const fetchToken = async () => {
      const accessToken = await getToken();

      async function geteventDetail(accessToken: string, eventId: number) {
        return await (
          await callAPI({
            url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/${eventId}/detail`!,
            method: "GET",
            isPrivate: true,
            accessToken,
          })
        ).json();
      }

      async function getMyId(accessToken: string) {
        return await (
          await callAPI({
            url: `${process.env.NEXT_PUBLIC_SERVER_URL}/user`!,
            method: "GET",
            isPrivate: true,
            accessToken,
          })
        ).json();
      }

      if (accessToken) {
        setToken(accessToken);

        const idRes = await getMyId(accessToken);
        setMyId(idRes.id);

        const pattern = /\/event\/(\d+)/;
        const match = pathname.match(pattern);
        if (match) {
          const eventId = +match[1];
          const res = await geteventDetail(accessToken, eventId);

          if (res.statusCode === 404) {
            alert("The event does not exist.");
            router.push("/board");
          } else if (res.statusCode === 403) {
            alert("Only participating users can check the event in detail.");
            router.push("/board");
          } else {
            setEventDetail(res);
          }

          const timeArray = [];
          for (let i = res.startTime; i < res.endTime; i++) {
            timeArray.push(i);
          }
          setTimes(timeArray);
        } else {
          alert("Cannot found eventId");
          redirect("/board");
        }
      } else {
        redirect("/login");
      }
    };

    fetchToken();
  }, [pathname, router]);

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
            router.back();
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
        <div className="text-3xl font-semibold">{eventDetail?.title}</div>
      </div>
      <div className="flex flex-col w-full min-h-fit pb-12 pt-6 px-12 rounded-lg bg-neutral-100 gap-6">
        {eventDetail?.hostId === myId ? (
          <div className="space-y-2">
            <div className="text-xl font-semibold">Invite members</div>
            <div className="flex flex-row space-x-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                maxLength={30}
                className="w-60 py-1.5 px-2 rounded-lg"
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="bg-green-500 px-3 rounded-lg text-white"
                onClick={async () => {
                  const emailRegex = /[A-Za-z0-9]+@([a-z]+\.){1,2}[a-z]{2,}/;
                  if (!emailRegex.test(email)) {
                    setInviteError("Please enter an email.");
                    return;
                  }

                  const res = await callAPI({
                    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/${
                      eventDetail!.id
                    }/invite`,
                    method: "POST",
                    body: {
                      email,
                    },
                    isPrivate: true,
                    accessToken: token,
                  });

                  if (res.status === 204) {
                    setEmail("");
                  } else if (res.status === 403)
                    setInviteError(
                      "Only host in the event can invite someone."
                    );
                  else if (res.status === 404)
                    setInviteError(
                      "Either the user or the event does not exist."
                    );
                  else if (res.status === 409)
                    setInviteError("The user was already invited.");
                }}
              >
                Invite
              </button>
            </div>
            <div className="text-red-600 pl-2">{inviteError}</div>
          </div>
        ) : null}
        <div className="flex flex-row space-x-4">
          <div className="flex-1 space-y-2 w-1/2">
            <div className="text-xl font-semibold">Your schedule</div>
            <div className="flex flex-row">
              <div className="flex flex-col text-right w-20 text-sm">
                <div className="h-14" />
                {times.map((time, idx) => (
                  <div key={idx} className="h-10 pr-1">{`${time} ${
                    time < 12 ? "AM" : "PM"
                  }`}</div>
                ))}
              </div>
              <div className="flex flex-row overflow-x-scroll">
                {eventDetail?.dates.map((d, idx) => {
                  const date = new Date(d);

                  return (
                    <div key={idx} className="flex flex-col">
                      <div className="h-14 w-11 *:text-center">
                        <div className="">
                          {`${date
                            .toLocaleString("default", { month: "long" })
                            .slice(0, 3)}`}
                        </div>
                        <div className="text-xl">{`${date.getDate()}`}</div>
                      </div>
                      {times.map((time, idx) => (
                        <div key={idx} className="h-10 border-2" />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-2 w-1/2">
            <div className="text-xl font-semibold">Team&apos;s schedule</div>
            <div className="flex flex-row">
              <div className="flex flex-col text-right w-20 text-sm">
                <div className="h-14" />
                {times.map((time, idx) => (
                  <div key={idx} className="h-10 pr-1">{`${time} ${
                    time < 12 ? "AM" : "PM"
                  }`}</div>
                ))}
              </div>
              <div className="flex flex-row overflow-x-scroll">
                {eventDetail?.dates.map((d, idx) => {
                  const date = new Date(d);

                  return (
                    <div key={idx} className="flex flex-col">
                      <div className="h-14 w-11 *:text-center">
                        <div className="">
                          {`${date
                            .toLocaleString("default", { month: "long" })
                            .slice(0, 3)}`}
                        </div>
                        <div className="text-xl">{`${date.getDate()}`}</div>
                      </div>
                      {times.map((time, idx) => (
                        <div key={idx} className="h-10 border-2" />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
