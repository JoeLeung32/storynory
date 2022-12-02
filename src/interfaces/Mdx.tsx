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
        thirdParty?: string
        slug?: string
        title?: string
        refer?: string
        partOfSpeech?: MdxPartOfSpeech[]
    }
    body?: string
}

export type { MdxWordsNodes, MdxPartOfSpeech, MdxPartOfSpeechExample }
