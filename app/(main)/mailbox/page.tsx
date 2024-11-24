"use client";

import callAPI from "@/lib/call-api";
import getToken from "@/lib/get-token";
import { MyEventData } from "@/lib/type/my-event-data.type";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MailBox() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [myEvents, setMyEvents] = useState<MyEventData[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "JOINED" | "REFUSED">(
    "PENDING"
  );
  const [myId, setMyId] = useState<number>();

  useEffect(() => {
    const fetchToken = async () => {
      const accessToken = await getToken();
      async function getMyEvents(accessToken: string) {
        return await (
          await callAPI({
            url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/my`!,
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

        const eventRes = await getMyEvents(accessToken);
        setMyEvents(eventRes.events);

        const idRes = await getMyId(accessToken);
        setMyId(idRes.id);
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
        <div className="text-3xl font-semibold">Mail Box</div>
      </div>
      <div className="flex flex-col w-full h-4/5 pb-12 pt-6 px-12 rounded-lg bg-neutral-100 gap-6">
        <div className="flex flex-row space-x-4 *:rounded-lg *:cursor-pointer *:px-3 *:py-1 *:text-gray-700">
          <div
            className={`${
              filter === "PENDING" ? "bg-yellow-300" : "bg-neutral-300"
            }`}
            onClick={() => {
              setFilter("PENDING");
            }}
          >
            Pending
          </div>
          <div
            className={`${
              filter === "JOINED" ? "bg-green-300" : "bg-neutral-300"
            }`}
            onClick={() => {
              setFilter("JOINED");
            }}
          >
            Joined
          </div>
          <div
            className={`${
              filter === "REFUSED" ? "bg-red-300" : "bg-neutral-300"
            }`}
            onClick={() => {
              setFilter("REFUSED");
            }}
          >
            Refused
          </div>
        </div>
        <div className="space-y-5 overflow-y-scroll">
          {myEvents
            .filter((event) => event.joinState === filter)
            .map((event, idx) => (
              <div
                key={idx}
                className="w-full bg-neutral-200 rounded-lg h-20 px-6 flex flex-row justify-between items-center"
              >
                <div className="flex flex-col ">
                  <span className="text-2xl font-semibold">{event.title}</span>
                  <span>
                    host: {event.hostName}{" "}
                    {event.hostId === myId ? (
                      <span className="bg-neutral-400 ml-1 text-xs text-white px-2 py-[2px] rounded-2xl">
                        host
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="flex fle-row gap-3">
                  {filter === "PENDING" ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-8 cursor-pointer hover:text-green-500"
                        onClick={async () => {
                          if (
                            confirm(
                              `Are you sure you want to join the event: ${event.title}?`
                            )
                          ) {
                            const res = await callAPI({
                              url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/${event.id}/join`!,
                              method: "PATCH",
                              isPrivate: true,
                              accessToken: token,
                            });
                            if (res.status === 204) {
                              location.reload();
                            }
                          }
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-8 cursor-pointer hover:text-red-500"
                        onClick={async () => {
                          if (
                            confirm(
                              `Are you sure you want to join the event: ${event.title}?`
                            )
                          ) {
                            const res = await callAPI({
                              url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/${event.id}/refuse`!,
                              method: "PATCH",
                              isPrivate: true,
                              accessToken: token,
                            });
                            if (res.status === 204) {
                              location.reload();
                            }
                          }
                        }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </>
                  ) : null}
                  {event.hostId === myId ? (
                    <svg
                      data-slot="icon"
                      fill="none"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="size-8 cursor-pointer hover:text-white"
                      onClick={async () => {
                        alert(
                          `Are you sure you want to delete the event: ${event.title}?`
                        );
                        const res = await callAPI({
                          url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/${event.id}/delete`!,
                          method: "DELETE",
                          isPrivate: true,
                          accessToken: token,
                        });
                        if (res.status === 204) {
                          setMyEvents((prev) =>
                            prev.filter((e) => e.id !== event.id)
                          );
                        }
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      data-slot="icon"
                      fill="none"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      className="size-8 cursor-pointer hover:text-white"
                      onClick={async () => {
                        if (
                          confirm(
                            `Are you sure you want to leave the event: ${event.title}?`
                          )
                        ) {
                          const res = await callAPI({
                            url: `${process.env.NEXT_PUBLIC_SERVER_URL}/event/${event.id}/exit`!,
                            method: "DELETE",
                            isPrivate: true,
                            accessToken: token,
                          });
                          if (res.status === 204) {
                            setMyEvents((prev) =>
                              prev.filter((e) => e.id !== event.id)
                            );
                          }
                        }
                      }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                      />
                    </svg>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
