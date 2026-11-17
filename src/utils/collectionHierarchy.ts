import { Collection } from "../types/models";

/**
 * Mengambil semua ID subkoleksi (anak, cucu, cicit, dst.) dari suatu koleksi.
 * Digunakan untuk mencegah pemindahan koleksi ke dalam subkoleksinya sendiri (circular dependency).
 */
export function getDescendantCollectionIds(
  collectionId: string,
  allCollections: Collection[]
): Set<string> {
  const descendants = new Set<string>();
  const queue: string[] = [collectionId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const c of allCollections) {
      if (c.parentId === currentId && !descendants.has(c.id)) {
        descendants.add(c.id);
        queue.push(c.id);
      }
    }
  }

  return descendants;
}

/**
 * Menghasilkan daftar koleksi induk yang valid untuk dipilih.
 * Koleksi induk yang valid TIDAK BOLEH:
 * 1. Koleksi itu sendiri (diri sendiri)
 * 2. Subkoleksi yang berada di dalam koleksi tersebut (turunannya secara berulang)
 */
export function getValidParentCollections(
  editingCollection: Collection | null | undefined,
  allCollections: Collection[]
): Collection[] {
  if (!editingCollection) {
    return allCollections;
  }

  const descendantIds = getDescendantCollectionIds(
    editingCollection.id,
    allCollections
  );

  return allCollections.filter(
    (c) => c.id !== editingCollection.id && !descendantIds.has(c.id)
  );
}

/**
 * Memvalidasi apakah target parentId aman untuk dijadikan induk bagi collectionId.
 */
export function isValidParentChoice(
  collectionId: string,
  targetParentId: string | null | undefined,
  allCollections: Collection[]
): boolean {
  if (!targetParentId) return true; // null/undefined selalu aman (menjadi koleksi utama)
  if (targetParentId === collectionId) return false; // tidak boleh menjadi induk dirinya sendiri

  const descendantIds = getDescendantCollectionIds(collectionId, allCollections);
  return !descendantIds.has(targetParentId);
}

/**
 * Memulihkan dan membersihkan hierarki koleksi dari circular dependency (loop perulangan)
 * atau parentId yang tidak valid / merujuk ke koleksi yang sudah tidak ada.
 * Menjamin semua koleksi tetap dapat diakses di antarmuka pengguna tanpa hilang atau rusak.
 */
export function sanitizeCollectionHierarchy(collections: Collection[]): Collection[] {
  if (!Array.isArray(collections)) return [];

  const colMap = new Map<string, Collection>();
  collections.forEach((c) => {
    if (c && c.id) {
      colMap.set(c.id, c);
    }
  });

  return collections.map((col) => {
    if (!col || !col.parentId) return col;

    // Lacak rantai induk ke atas untuk memastikan tidak ada loop dan induknya eksis
    const visited = new Set<string>([col.id]);
    let currParentId: string | null = col.parentId;

    while (currParentId) {
      if (visited.has(currParentId)) {
        // Terdeteksi perulangan siklus! Putuskan siklus dengan menjadikannya root
        return { ...col, parentId: null };
      }
      visited.add(currParentId);
      const parentCol = colMap.get(currParentId);
      if (!parentCol) {
        // Induk tidak ditemukan di database! Putuskan referensi ke root
        return { ...col, parentId: null };
      }
      currParentId = parentCol.parentId || null;
    }

    return col;
  });
}
