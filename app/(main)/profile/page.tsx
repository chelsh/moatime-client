"use client";

import callAPI from "@/lib/call-api";
import getToken from "@/lib/get-token";
import deleteCookie from "@/lib/server/delete-cookie";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  name: string;
  email: string;
};

export default function Profile() {
  const router = useRouter();
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [previousProfile, setPreviousProfile] = useState<Profile>();

  useEffect(() => {
    const fetchToken = async () => {
      const accessToken = await getToken();

      async function getMyProfile(accessToken: string) {
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
        const res = await getMyProfile(accessToken);

        setEmail(res.email);
        setName(res.name);
        setPreviousProfile({ name: res.name, email: res.email });
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
        <div className="text-3xl font-semibold">My Profile</div>
      </div>
      <div className="flex flex-col w-full h-2/5 pb-12 pt-6 px-12 rounded-lg bg-neutral-100 gap-6">
        <div className="space-y-3">
          <div className="text-xl font-semibold">Name</div>
          <input
            type="text"
            value={name}
            className="w-1/2 py-1.5 px-2 rounded-lg"
            onChange={(e) => setName(e.target.value)}
          />
          <div className="text-xl font-semibold">Email</div>
          <input
            type="text"
            value={email}
            className="w-1/2 py-1.5 px-2 rounded-lg"
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* <div className="text-xl font-semibold">Password</div>
          <input type="text" className="w-1/2 py-1.5 px-2 rounded-lg" /> */}
        </div>
        <div className="w-full flex justify-end gap-3">
          <button
            className="px-3 py-1 rounded-lg bg-green-300 font-semibold"
            onClick={async () => {
              if (
                previousProfile?.name === name &&
                previousProfile.email === email
              ) {
                alert("Please change your profile data.");
              } else {
                const res = await callAPI({
                  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/user`!,
                  method: "PATCH",
                  body: {
                    email,
                    name,
                  },
                  isPrivate: true,
                  accessToken: token,
                });
                if (res.ok) {
                  location.reload();
                }
              }
            }}
          >
            update profile
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-red-300 font-semibold"
            onClick={async () => {
              if (confirm(`Are you sure you want to delete your account?`)) {
                const res = await callAPI({
                  url: `${process.env.NEXT_PUBLIC_SERVER_URL}/user`!,
                  method: "DELETE",
                  isPrivate: true,
                  accessToken: token,
                });
                if (res.ok) {
                  location.reload();
                }
              }
            }}
          >
            delete account
          </button>
          <button
            className="px-3 py-1 rounded-lg bg-neutral-300 font-semibold"
            onClick={async () => {
              alert("Are you sure you want to log out?");
              await deleteCookie("refreshToken");
              redirect("/login");
            }}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
