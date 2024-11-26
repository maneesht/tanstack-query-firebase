import { describe, expect, test, beforeEach } from "vitest";
import { useConnectQuery } from "./useConnectQuery";
import { renderHook, waitFor } from "@testing-library/react";
import { listMoviesRef, createMovie } from "@/dataconnect/default-connector";
import { firebaseApp } from "~/testing-utils";
import { queryClient, wrapper } from "../../utils";

// initialize firebase app
firebaseApp;

describe("useConnectQuery", () => {
  beforeEach(async () => {
    queryClient.clear();
  });

  test("returns pending state initially", async () => {
    const { result } = renderHook(() => useConnectQuery(listMoviesRef()), {
      wrapper,
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.status).toBe("pending");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
  });

  test("fetches data successfully", async () => {
    const { result } = renderHook(() => useConnectQuery(listMoviesRef()), {
      wrapper,
    });

    expect(result.current.isPending).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("movies");
    expect(Array.isArray(result.current.data?.movies)).toBe(true);
    expect(result.current.data?.movies.length).toBeGreaterThanOrEqual(0);
  });

  test("refetches data successfully", async () => {
    const { result } = renderHook(() => useConnectQuery(listMoviesRef()), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.refetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data).toHaveProperty("movies");
    expect(Array.isArray(result.current.data?.movies)).toBe(true);
    expect(result.current.data?.movies.length).toBeGreaterThanOrEqual(0);
  });

  test("returns correct data", async () => {
    const { result } = renderHook(() => useConnectQuery(listMoviesRef()), {
      wrapper,
    });

    await createMovie({
      title: "tanstack query firebase",
      genre: "library",
      imageUrl: "https://invertase.io/",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.movies).toBeDefined();
    expect(Array.isArray(result.current.data?.movies)).toBe(true);

    const movie = result.current.data?.movies.find(
      (m) => m.title === "tanstack query firebase"
    );

    expect(movie).toBeDefined();
    expect(movie).toHaveProperty("title", "tanstack query firebase");
    expect(movie).toHaveProperty("genre", "library");
    expect(movie).toHaveProperty("imageUrl", "https://invertase.io/");
  });

  test("returns the correct data properties", async () => {
    const { result } = renderHook(() => useConnectQuery(listMoviesRef()), {
      wrapper,
    });

    await createMovie({
      title: "tanstack query firebase",
      genre: "library",
      imageUrl: "https://invertase.io/",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    result.current.data?.movies.forEach((i) => {
      expect(i).toHaveProperty("title");
      expect(i).toHaveProperty("genre");
      expect(i).toHaveProperty("imageUrl");
    });
  });
});
