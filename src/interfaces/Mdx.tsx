interface MdxPartOfSpeechExample {
    en: string
    tc?: string
    [x: string]: any
}

interface MdxPartOfSpeech extends MdxPartOfSpeechExample {
    type: string
    examples: MdxPartOfSpeechExample[]
    moreExamples: string[]
}

interface MdxWordsNodes {
    frontmatter: {
        slug?: string
        title?: string
        thirdParty?: string
        partOfSpeech?: MdxPartOfSpeech[]
    }
    body?: string
}

export type { MdxWordsNodes, MdxPartOfSpeech, MdxPartOfSpeechExample }
