interface UserMessageProps {
  content: string
  media?: string[]
}

export function UserMessage({ content, media }: UserMessageProps) {
  const hasTextContent = content.trim().length > 0

  return (
    <div className="flex w-full flex-col items-end gap-1.5">
      {media && media.length > 0 && (
        <div className="flex max-w-[70%] flex-wrap justify-end gap-2">
          {media.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="max-h-48 rounded-xl object-cover shadow-sm"
            />
          ))}
        </div>
      )}
      {hasTextContent && (
        <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-violet-500 px-5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-white shadow-sm break-words">
          {content}
        </div>
      )}
    </div>
  )
}
