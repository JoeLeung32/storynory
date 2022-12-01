import React, { useState } from 'react'
import { CaptionLine, TypeAudioTimeFormat } from '../../interfaces/Caption'
import {
    StyledParagraphLine,
    StyledParagraphTranslation
} from '../styled/StyledParagraph'
import styled from 'styled-components'

interface Props {
    id: string
    data: [CaptionLine]
    currentScriptId?: string | null
    translationCode: string
    wordsMdx?: any
    audio?: HTMLAudioElement
    handleAudioTimeLoop: any
    handleHighlighter: any
}

export interface MdxPartOfSpeechExample {
    en: string
    tc?: string
    [x: string]: any
}

export interface MdxPartOfSpeech extends MdxPartOfSpeechExample {
    type: string
    examples: MdxPartOfSpeechExample[]
    moreExamples: string[]
}

interface MdxNodes {
    frontmatter: {
        slug?: string
        title?: string
        thirdParty?: string
        partOfSpeech?: MdxPartOfSpeech[]
    }
    body?: string
}

const StoryBookParagraph: React.FC<Props> = (props) => {
    const { data, id: parentId, translationCode } = props
    const { audio, handleAudioTimeLoop, handleHighlighter } = props
    const { currentScriptId, wordsMdx } = props
    const [highlighter, setHighlighter] = useState<boolean>(true)
    const charsRegExp = new RegExp(/[ ,.;:~\-=#_"'“‘()\[\]{}]/)
    const audioControl = {
        set: async (start: TypeAudioTimeFormat, end: TypeAudioTimeFormat) => {
            if (!audio) return
            handleAudioTimeLoop({
                start: start,
                end: end
            })
            audio.currentTime = start || 0
            await audio.play()
        }
    }
    const doTranslationTag = (line: CaptionLine) => {
        let scriptContent = line.content
        if (!wordsMdx) return scriptContent
        wordsMdx.forEach((node: MdxNodes, idx: number) => {
            if (!node.frontmatter.slug) return
            const keyword = node.frontmatter.slug.toString()
            const targetWordIndex = scriptContent
                .toLowerCase()
                .search(keyword.toLowerCase())
            const twiPrevString = scriptContent.substring(
                targetWordIndex - 1,
                targetWordIndex
            )
            const twiNextString = scriptContent.substring(
                targetWordIndex + keyword.length,
                targetWordIndex + keyword.length + 1
            )
            const isMatchedCharsRexExp =
                twiPrevString.search(charsRegExp) === 0 &&
                twiNextString.search(charsRegExp) === 0
            if (targetWordIndex >= 0 && isMatchedCharsRexExp) {
                const actualWord = scriptContent.substring(
                    targetWordIndex,
                    targetWordIndex + keyword.length
                )
                const newWord = `<span class="translationTag" data-word-idx="${idx}">${actualWord}</span> <i class="text-danger fa-solid fa-language"></i>`
                scriptContent = scriptContent.replace(actualWord, newWord)
            }
        })
        return scriptContent
    }
    return (
        <>
            {data.map((line, idx) => {
                const eleId = `${parentId}l${idx}`
                const standalone = line.standalone
                const timestampStart = line.start
                const timestampEnd = line.end
                const translation = line.translation
                const scriptContent = doTranslationTag(line)
                return (
                    <StyledParagraphLine
                        key={idx}
                        standalone={standalone}
                        id={eleId}
                        className={`storyParagraph m-0 py-3 py-md-0`}
                        data-start={timestampStart}
                        data-end={timestampEnd}
                    >
                        <div className={`p-2 px-3`}>
                            <StyledParagraphTranslation>
                                {translationCode &&
                                    translation &&
                                    translation[translationCode] && (
                                        <small>
                                            {translation[translationCode]}
                                        </small>
                                    )}
                                {!translation && <small>...</small>}
                            </StyledParagraphTranslation>
                            <StyledScriptTag
                                className={`script`}
                                dangerouslySetInnerHTML={{
                                    __html: scriptContent
                                }}
                            ></StyledScriptTag>
                            <div>
                                <button
                                    title={`Loop this one`}
                                    className={`btn btn-sm btn-link`}
                                    onClick={() =>
                                        audioControl.set(
                                            timestampStart,
                                            timestampEnd
                                        )
                                    }
                                >
                                    <i className="fa-solid fa-repeat"></i>
                                </button>
                                {(eleId !== currentScriptId ||
                                    audio?.paused) && (
                                    <button
                                        title={`Play from here`}
                                        className={`btn btn-sm btn-link`}
                                        onClick={() =>
                                            audioControl.set(
                                                timestampStart,
                                                null
                                            )
                                        }
                                    >
                                        <i className="fa-solid fa-play"></i>
                                    </button>
                                )}
                                {eleId === currentScriptId &&
                                    !audio?.paused && (
                                        <button
                                            title={`Pause`}
                                            className={`btn btn-sm btn-link`}
                                            onClick={() => audio?.pause()}
                                        >
                                            <i className="fa-solid fa-pause"></i>
                                        </button>
                                    )}
                                <button
                                    title={`Stop highlight and auto-scroll`}
                                    className={`btn btn-sm btn-link ${
                                        highlighter
                                            ? 'text-primary'
                                            : 'text-secondary'
                                    }`}
                                    onClick={() => {
                                        const rs = !highlighter
                                        handleHighlighter(rs)
                                        setHighlighter(rs)
                                    }}
                                >
                                    <i className="fa-solid fa-highlighter"></i>
                                </button>
                            </div>
                        </div>
                    </StyledParagraphLine>
                )
            })}
        </>
    )
}

export default StoryBookParagraph

const StyledScriptTag = styled.div`
    > .translationTag {
        cursor: pointer;
        font-weight: bold;
        text-decoration: underline;
        position: relative;
    }
`
