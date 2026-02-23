import { apiClient, WS_BASE_URL } from './index';

// const isUUID = (value: string) =>
//     /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);


export async function createLectureTask() {
  console.log("[FRONT] Creating new lecture task...");
  const res = await apiClient.get('/task/create');
  console.log("error", res.data.msg);
  if (res.data.status !== 'success' || !res.data.msg) {
    throw new Error('Failed to create task');
  }
  console.log("[FRONT] Task created:", res.data.msg);
  return { taskId: res.data.msg };
}

export async function uploadAudioViaHTTP(
  file: File,
  taskId: string,
  onStatusChange?: (status: string) => void
): Promise<{ lectureId: string }> {
  
  console.log(`[FRONT] Starting upload for task ${taskId}`);

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_BASE_URL}/task/ws/${taskId}`);

    ws.onopen = async () => {
      console.log(`[FRONT] WS open for task ${taskId}`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        await apiClient.post(
          `/task/start/${taskId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log(`[FRONT] Upload finished, waiting for STT...`);
      } catch (err) {
        console.error(`[FRONT] Upload failed:`, err);
        ws.close();
        reject(err);
      }
    };

    let flag: boolean = false;

    ws.onmessage = (event) => {
      const msg = String(event.data);
      console.log('[WS]', msg);

      if (flag) {
        ws.close();
        resolve({ lectureId: msg });
        return;
      } else if (msg == "finish" || msg == "error") {
        flag = true;
      }
      // if (isUUID(msg)) {
      //   ws.close();
      //   resolve({ lectureId: msg });
      //   return;
      // }

      onStatusChange?.(msg);
    };

    ws.onerror = (e) => {
      ws.close();
      reject(e);
    };

    ws.onclose = () => console.log(`[FRONT] WS closed (${taskId})`);
  });
}

export async function getLectureResult(lectureId: string) {
  console.log(`[FRONT] Requesting result for task ${lectureId}`);
  const res = await apiClient.get(`/api/lectures/${lectureId}`);
  console.log(`[FRONT] Result received for task ${lectureId}:`, res.data);
  return res.data;
}
