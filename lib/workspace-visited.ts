import { BUDDYUP_WORKSPACE_VISITED_V1_KEY } from "@/lib/buddyup-local-storage";

/** 打开工作台并切到「我的背景」 */
export const WORKSPACE_BACKGROUND_HREF = "/workspace?view=background";

/** 测试菜单专用：进入完整问卷页时带上，跳过「已访问工作台则重定向到我的背景」 */
export const QUESTIONNAIRE_TEST_HREF = "/questionnaire?testQuestionnaire=1";

const VISITED_EVENT = "buddyup-workspace-visited";

export function readWorkspaceVisited(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(BUDDYUP_WORKSPACE_VISITED_V1_KEY) === "1";
  } catch {
    return false;
  }
}

export function markWorkspaceVisited(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.localStorage.getItem(BUDDYUP_WORKSPACE_VISITED_V1_KEY) === "1") return;
    window.localStorage.setItem(BUDDYUP_WORKSPACE_VISITED_V1_KEY, "1");
    window.dispatchEvent(new Event(VISITED_EVENT));
  } catch {
    // ignore quota / private mode
  }
}

export function subscribeWorkspaceVisited(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === BUDDYUP_WORKSPACE_VISITED_V1_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(VISITED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(VISITED_EVENT, onStoreChange);
  };
}
