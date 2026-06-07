"use client"

import { create } from "zustand"
import apiClient from "@/lib/axiosClients"

export interface SavedExtractedSelection {
  fileName: string
  headers: string[]
  rows: Record<string, unknown>[]
  savedAt: string
}

interface ExtractedSelectionState {
  savedSelection: SavedExtractedSelection | null
  isLoading: boolean
  isInitialized: boolean
}

interface ExtractedSelectionActions {
  fetchSavedSelection: () => Promise<void>
  saveSelection: (selection: SavedExtractedSelection) => Promise<void>
  clearSavedSelection: () => Promise<void>
}

type ExtractedSelectionStore = ExtractedSelectionState & ExtractedSelectionActions

function unwrapApiData<T>(res: { data: unknown }): T | null {
  const body = res.data as { data?: T; status?: string }
  if (body && typeof body === "object" && "data" in body) {
    return (body.data ?? null) as T | null
  }
  return null
}

function normalizeSelection(raw: SavedExtractedSelection | null): SavedExtractedSelection | null {
  if (!raw?.rows?.length) return null
  const headers = Array.isArray(raw.headers) ? raw.headers.filter((h) => typeof h === "string") : []
  const rows = raw.rows.map((row) => {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      return row as Record<string, unknown>
    }
    return {}
  })
  return {
    fileName: raw.fileName ?? "extract",
    headers,
    rows,
    savedAt: raw.savedAt ?? new Date().toISOString(),
  }
}

export const useExtractedSelectionStore = create<ExtractedSelectionStore>()((set, get) => ({
  savedSelection: null,
  isLoading: false,
  isInitialized: false,

  fetchSavedSelection: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const res = await apiClient.get("/extracted-selections")
      set({
        savedSelection: normalizeSelection(unwrapApiData<SavedExtractedSelection>(res)),
        isInitialized: true,
      })
    } catch {
      set({ isInitialized: true })
    } finally {
      set({ isLoading: false })
    }
  },

  saveSelection: async (selection) => {
    const previous = get().savedSelection
    set({ savedSelection: selection, isLoading: true })
    try {
      await apiClient.put("/extracted-selections", selection)
    } catch (err) {
      set({ savedSelection: previous })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  clearSavedSelection: async () => {
    const previous = get().savedSelection
    set({ savedSelection: null, isLoading: true })
    try {
      await apiClient.delete("/extracted-selections")
    } catch (err) {
      set({ savedSelection: previous })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
}))
