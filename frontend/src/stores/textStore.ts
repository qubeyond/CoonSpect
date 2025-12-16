import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLectureTask, uploadAudioViaHTTP, getLectureResult } from '../api/lectureApi';

interface AudioState {
  audioFile: File | null;
  audioUrl: string | null;
  isSaving: boolean;
  processedText: string;
  progressStatus: string | null;

  setAudioFile: (file: File | null) => void;
  setIsSaving: (saving: boolean) => void;
  setProcessedText: (text: string) => void;
  setProgressStatus: (status: string | null) => void;
  reset: () => void;
  clearAudioFile: () => void;

  generateTranscript: (file: File) => Promise<void>;
}

export const useTextStore = create<AudioState>()(
  persist(
    (set, get) => ({
      audioFile: null,
      audioUrl: null,
      isSaving: false,
      processedText: '',
      progressStatus: null,

      setAudioFile: (file) => {
        const prev = get().audioUrl;
        if (prev) URL.revokeObjectURL(prev);

        if (file) {
          const audioUrl = URL.createObjectURL(file);
          set({ audioFile: file, audioUrl });
        } else {
          set({ audioFile: null, audioUrl: null });
        }
      },

      setIsSaving: (isSaving) => set({ isSaving }),
      setProcessedText: (text) => set({ processedText: text }),
      setProgressStatus: (status) => set({ progressStatus: status }),

      reset: () => set({
        audioFile: null,
        audioUrl: null,
        isSaving: false,
        processedText: '',
        progressStatus: null,
      }),

      clearAudioFile: () => {
        const prev = get().audioUrl;
        if (prev) URL.revokeObjectURL(prev);
        set({ audioFile: null, audioUrl: null, isSaving: false });
      },

generateTranscript: async (file: File) => {
        set({ isSaving: true, progressStatus: 'uploading' });

        try {
          // create task
          const { taskId } = await createLectureTask();
          console.log('[FRONT] task created', taskId);

          // upload + ws tracking
          const { lectureId } = await uploadAudioViaHTTP(
            file,
            taskId,
            (status) => set({ progressStatus: status })
          );

          console.log('[FRONT] lecture_id received', lectureId);

          // get result
          const lecture = await getLectureResult(lectureId);

          // text_url сейчас путь к txt
          if (lecture.text_url) {
            const text = await fetch(lecture.text_url).then((r) => r.text());
            set({ processedText: text });
          }

          set({ progressStatus: 'finish' });
        } catch (e) {
          console.error('[FRONT] audio processing error', e);
          set({ progressStatus: null });
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: 'audio-storage',
      partialize: (state) => ({
        processedText: state.processedText,
        progressStatus: state.progressStatus,
      }),
    }
  )
);
