# FTL iMeeting Booking System

This project is a full-stack web application built for the **Full Stack at FTL Gym** technical test. 

It is designed to manage meeting room bookings (Pesan Ruangan) and demonstrates a complete, end-to-end flow from the user interface to the database.

## Architecture

This project is built using **Next.js** as a complete full-stack framework. 

Because Next.js can handle both client-side UI (Frontend) and server-side logic (Backend) within a single repository, there is no need to separate the architecture into two distinct projects.

*   **Frontend**: Built with React, Tailwind CSS, and Next.js App Router (`app/page.tsx`, `app/pesan-ruangan/page.tsx`). It features a modern, responsive UI designed to match the provided specifications.
*   **Backend / API**: Uses Next.js **Route Handlers** (`app/api/bookings/route.ts`) to simulate a proper backend REST API workflow. The frontend sends HTTP requests to these routes to fetch, create, update, and delete data.
*   **Database**: Powered by **Supabase** (PostgreSQL). The backend API interacts securely with Supabase using the `@supabase/supabase-js` client.

## Features

*   **Dashboard**: View all meeting room bookings in a clean, paginated data table.
*   **Pesan Ruangan (Create)**: A comprehensive form to book a meeting room, including capacity and data validation.
*   **Edit Booking**: Modify existing bookings (updates are sent via `PUT` requests to the API).
*   **Delete Booking**: Remove bookings with a single click (handled via `DELETE` requests to the API).

## Tech Stack

*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS
*   **Database**: Supabase
*   **Icons**: Heroicons
