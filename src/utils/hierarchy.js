/**
 * PSP-Hierarchie-Utilities
 * Baumstruktur aus flacher Vorgangsliste aufbauen, ein-/ausklappen, PSP-Codes generieren
 */

/**
 * Baut die Baumstruktur aus der flachen Vorgangsliste.
 * @param {import('../models/types').Task[]} vorgaenge
 * @returns {{ childrenMap: Map<string, import('../models/types').Task[]>, depthMap: Map<string, number>, roots: import('../models/types').Task[] }}
 */
export function buildTree(vorgaenge) {
  const childrenMap = new Map(); // parentId → [child, child, ...]
  const depthMap = new Map();    // taskId → depth (0 = root)
  const taskMap = new Map();     // taskId → task

  for (const v of vorgaenge) {
    taskMap.set(v.id, v);
    if (!childrenMap.has(v.id)) childrenMap.set(v.id, []);
  }

  const roots = [];

  for (const v of vorgaenge) {
    if (v.elternId && taskMap.has(v.elternId)) {
      if (!childrenMap.has(v.elternId)) childrenMap.set(v.elternId, []);
      childrenMap.get(v.elternId).push(v);
    } else {
      roots.push(v);
    }
  }

  // Kinder nach Sortierung ordnen
  for (const [, children] of childrenMap) {
    children.sort((a, b) => a.sortierung - b.sortierung);
  }
  roots.sort((a, b) => a.sortierung - b.sortierung);

  // Tiefen berechnen (DFS)
  function setDepth(tasks, depth) {
    for (const t of tasks) {
      depthMap.set(t.id, depth);
      const children = childrenMap.get(t.id) || [];
      if (children.length > 0) setDepth(children, depth + 1);
    }
  }
  setDepth(roots, 0);

  return { childrenMap, depthMap, roots };
}

/**
 * Flacht den Baum in eine geordnete Liste ab (Depth-First),
 * wobei eingeklappte Teilbäume übersprungen werden.
 * @param {import('../models/types').Task[]} vorgaenge
 * @param {Set<string>} collapsedIds - IDs der eingeklappten Sammelvorgänge
 * @returns {import('../models/types').Task[]}
 */
export function flattenTree(vorgaenge, collapsedIds) {
  const { childrenMap, roots } = buildTree(vorgaenge);
  const result = [];

  function walk(tasks) {
    for (const t of tasks) {
      result.push(t);
      if (!collapsedIds.has(t.id)) {
        const children = childrenMap.get(t.id) || [];
        if (children.length > 0) walk(children);
      }
    }
  }
  walk(roots);
  return result;
}

/**
 * Gibt alle Nachkommen-IDs eines Vorgangs zurück (rekursiv).
 * @param {string} taskId
 * @param {Map<string, import('../models/types').Task[]>} childrenMap
 * @returns {string[]}
 */
export function getDescendants(taskId, childrenMap) {
  const result = [];
  const children = childrenMap.get(taskId) || [];
  for (const c of children) {
    result.push(c.id);
    result.push(...getDescendants(c.id, childrenMap));
  }
  return result;
}

/**
 * Weist PSP-Codes automatisch basierend auf der Baumstruktur zu.
 * Nur bei Vorgängen mit leerem pspCode.
 * @param {import('../models/types').Task[]} vorgaenge
 * @returns {import('../models/types').Task[]}
 */
export function autoAssignPspCodes(vorgaenge) {
  const { childrenMap, roots } = buildTree(vorgaenge);
  const codeMap = new Map(); // taskId → pspCode

  function assign(tasks, prefix) {
    tasks.forEach((t, i) => {
      const code = prefix ? `${prefix}.${i + 1}` : `${i + 1}`;
      codeMap.set(t.id, code);
      const children = childrenMap.get(t.id) || [];
      if (children.length > 0) assign(children, code);
    });
  }
  assign(roots, '');

  return vorgaenge.map((v) => {
    const newCode = codeMap.get(v.id);
    // Nur leere PSP-Codes überschreiben
    if (!v.pspCode && newCode) return { ...v, pspCode: newCode };
    return v;
  });
}

/**
 * Prüft ob ein Vorgang Kinder hat (ist also effektiv ein Sammelvorgang).
 * @param {string} taskId
 * @param {import('../models/types').Task[]} vorgaenge
 * @returns {boolean}
 */
export function hatKinder(taskId, vorgaenge) {
  return vorgaenge.some((v) => v.elternId === taskId);
}

/**
 * Rückt einen Vorgang ein (wird Kind des vorherigen Vorgangs auf gleicher Ebene).
 * @param {import('../models/types').Task[]} vorgaenge
 * @param {string} taskId - ID des einzurückenden Vorgangs
 * @returns {import('../models/types').Task[] | null} Neue Vorgangsliste oder null wenn nicht möglich
 */
export function einruecken(vorgaenge, taskId) {
  const { roots, childrenMap, depthMap } = buildTree(vorgaenge);
  const task = vorgaenge.find((v) => v.id === taskId);
  if (!task) return null;

  const depth = depthMap.get(taskId) || 0;
  if (depth >= 4) return null; // Max 4 Ebenen

  // Finde den vorherigen Vorgang auf gleicher Ebene
  const siblings = task.elternId ? (childrenMap.get(task.elternId) || []) : roots;
  const idx = siblings.findIndex((v) => v.id === taskId);
  if (idx <= 0) return null; // Kein Vorgänger → kann nicht einrücken

  const neuerEltern = siblings[idx - 1];

  return vorgaenge.map((v) => {
    if (v.id === taskId) {
      return { ...v, elternId: neuerEltern.id };
    }
    // Neuen Eltern ggf. zu Sammelvorgang konvertieren
    if (v.id === neuerEltern.id && v.typ !== 'Sammelvorgang') {
      return { ...v, typ: 'Sammelvorgang' };
    }
    return v;
  });
}

/**
 * Rückt einen Vorgang aus (wird auf die Ebene des Eltern-Vorgangs verschoben).
 * @param {import('../models/types').Task[]} vorgaenge
 * @param {string} taskId
 * @returns {import('../models/types').Task[] | null}
 */
export function ausruecken(vorgaenge, taskId) {
  const task = vorgaenge.find((v) => v.id === taskId);
  if (!task || !task.elternId) return null; // Schon auf Wurzelebene

  const eltern = vorgaenge.find((v) => v.id === task.elternId);
  if (!eltern) return null;

  const neuerElternId = eltern.elternId || null; // Großeltern oder null (Wurzel)

  let result = vorgaenge.map((v) => {
    if (v.id === taskId) return { ...v, elternId: neuerElternId };
    return v;
  });

  // Prüfe ob alter Eltern noch Kinder hat, sonst Typ zurücksetzen
  const hatNochKinder = result.some((v) => v.elternId === eltern.id && v.id !== taskId);
  if (!hatNochKinder) {
    result = result.map((v) =>
      v.id === eltern.id && v.typ === 'Sammelvorgang' ? { ...v, typ: 'Vorgang' } : v
    );
  }

  return result;
}
