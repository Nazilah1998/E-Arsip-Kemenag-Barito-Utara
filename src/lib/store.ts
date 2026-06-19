import { create } from "zustand"

interface UIState {
  selectedIds: string[]
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isGridView: boolean
  setGridView: (val: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  selectedIds: [],
  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),
  selectAll: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  isGridView: false,
  setGridView: (val) => set({ isGridView: val }),
}))
