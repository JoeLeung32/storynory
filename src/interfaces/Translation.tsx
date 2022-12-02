import { MdxPartOfSpeech } from './Mdx'

interface TranslationContent {
    wordId: string
    word: string
    refer?: string
    partOfSpeech: MdxPartOfSpeech[]
    target?: HTMLElement
    thirdPartyUrls?: string
}

export type { TranslationContent }
