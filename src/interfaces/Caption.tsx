type TypeAudioTimeFormat = number | null

interface CaptionTimestamp {
    start: TypeAudioTimeFormat
    end: TypeAudioTimeFormat
}

interface CaptionLine extends CaptionTimestamp {
    content: string
    translation?: {
        [tc: string]: string | undefined
    }
    standalone?: boolean
}

interface Caption {
    type: 'paragraph'
    data: [CaptionLine]
}

export type { Caption, CaptionLine, CaptionTimestamp, TypeAudioTimeFormat }
