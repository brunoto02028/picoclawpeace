import {
  IconArrowUp,
  IconMicrophone,
  IconMicrophoneOff,
  IconPhoto,
  IconX,
} from "@tabler/icons-react"
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import TextareaAutosize from "react-textarea-autosize"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly [index: number]: { transcript: string }
}

interface SpeechRecognitionEvent {
  readonly resultIndex: number
  readonly results: { length: number } & { [index: number]: SpeechRecognitionResult }
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionConstructor | undefined {
  if (typeof window === "undefined") return undefined
  const w = window as unknown as Record<string, unknown>
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | SpeechRecognitionConstructor
    | undefined
}

interface ChatComposerProps {
  input: string
  onInputChange: (value: string) => void
  images: string[]
  onImagesChange: (images: string[]) => void
  onSend: () => void
  isConnected: boolean
  hasDefaultModel: boolean
}

export function ChatComposer({
  input,
  onInputChange,
  images,
  onImagesChange,
  onSend,
  isConnected,
  hasDefaultModel,
}: ChatComposerProps) {
  const { t } = useTranslation()
  const canInput = isConnected && hasDefaultModel
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? [])
      if (files.length === 0) return

      const readers = files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          }),
      )

      void Promise.all(readers).then((dataUrls) => {
        onImagesChange([...images, ...dataUrls])
      })

      e.target.value = ""
    },
    [images, onImagesChange],
  )

  const removeImage = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index))
    },
    [images, onImagesChange],
  )

  const toggleVoice = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition()
    if (!SpeechRecognitionAPI) {
      toast.error("Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.")
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "pt-BR"

    let finalTranscript = ""

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim = result[0].transcript
        }
      }
      onInputChange(finalTranscript + interim)
    }

    recognition.onend = () => setIsListening(false)

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false)
      if (event.error === "not-allowed" || event.error === "permission-denied") {
        toast.error("Permissão de microfone negada. Clique no cadeado na barra de endereços e permita o microfone.")
      } else if (event.error === "network") {
        toast.error(
          "O reconhecimento de voz requer acesso à internet e não funciona no preview embutido. Abra http://localhost:5173 diretamente no Chrome.",
          { duration: 6000 },
        )
      } else if (event.error === "no-speech") {
        // silently reset — no speech detected is not an error
      } else {
        toast.error(`Erro no microfone: ${event.error}`)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
      toast.error("Não foi possível iniciar o microfone. Tente novamente.")
    }
  }, [isListening, onInputChange])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const canSend = canInput && (!!input.trim() || images.length > 0)

  const hasSpeechSupport = !!getSpeechRecognition()

  return (
    <div className="bg-background shrink-0 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:px-8 md:pb-8 lg:px-24 xl:px-48">
      <div className="bg-card border-border/80 mx-auto flex max-w-[1000px] flex-col rounded-2xl border p-3 shadow-md">
        {images.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2 px-2">
            {images.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt=""
                  className="size-16 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="bg-background/80 absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border"
                >
                  <IconX className="size-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <TextareaAutosize
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          disabled={!canInput}
          className={cn(
            "placeholder:text-muted-foreground max-h-[200px] min-h-[60px] resize-none border-0 bg-transparent px-2 py-1 text-[15px] shadow-none transition-colors focus-visible:ring-0 focus-visible:outline-none dark:bg-transparent",
            !canInput && "cursor-not-allowed",
          )}
          minRows={1}
          maxRows={8}
        />

        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground size-8 rounded-full hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canInput}
              title="Enviar imagem"
            >
              <IconPhoto className="size-4" />
            </Button>

            {hasSpeechSupport && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8 rounded-full",
                  isListening
                    ? "bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={toggleVoice}
                title={isListening ? "Parar gravação" : "Falar mensagem"}
              >
                {isListening ? (
                  <IconMicrophoneOff className="size-4" />
                ) : (
                  <IconMicrophone className="size-4" />
                )}
              </Button>
            )}
          </div>

          <Button
            size="icon"
            className="size-8 rounded-full bg-violet-500 text-white transition-transform hover:bg-violet-600 active:scale-95"
            onClick={onSend}
            disabled={!canSend}
          >
            <IconArrowUp className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
