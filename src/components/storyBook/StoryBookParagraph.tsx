import React from 'react'
import styled from 'styled-components'
import {
    StyledParagraphLine,
    StyledParagraphTranslation
} from '../styled/StyledParagraph'
import { CaptionLine, TypeAudioTimeFormat } from '../../interfaces/Caption'
import { MdxWordsNodes } from '../../interfaces/Mdx'

interface Props {
    id: string
    data: [CaptionLine]
    currentScriptId?: string | null
    translationCode?: string
    wordsMdx?: any
    audio?: HTMLAudioElement | null
    handleAudioTimeLoop?: any
    pause?: boolean
    handleAudioPause?: any
    highlighter?: boolean
    handleHighlighter?: any
}

const StoryBookParagraph: React.FC<Props> = (props) => {
    const { data, id: parentId, translationCode } = props
    const { audio, handleAudioTimeLoop } = props
    const { pause, handleAudioPause } = props
    const { highlighter, handleHighlighter } = props
    const { currentScriptId, wordsMdx } = props
    const charsRegExp = new RegExp(/[ ,.;:~\-=#_"'“‘()\[\]{}?!]/)
    const audioControl = {
        set: async (start: TypeAudioTimeFormat, end: TypeAudioTimeFormat) => {
            if (!handleAudioTimeLoop) return
            handleAudioTimeLoop({
                start: start,
                end: end
            })
            if (!audio) return
            audio.currentTime = start || 0
            await audio.play()
            handleAudioPause(false)
        },
        pause: () => {
            if (!audio) return
            audio?.pause()
            handleAudioPause(true)
        }
    }
    const doTranslationTag = (line: CaptionLine) => {
        let scriptContent = line.content
        if (!wordsMdx) return scriptContent
        wordsMdx.forEach((node: MdxWordsNodes, idx: number) => {
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
    const doButtonGroup = (line: CaptionLine, idx: number) => {
        const eleId = `${parentId}l${idx}`
        const timestampStart = line.start
        const timestampEnd = line.end
        const btnPlayShow = eleId !== currentScriptId || pause
        const btnPauseShow = eleId === currentScriptId && !pause
        return (
            <div>
                <button
                    title={`Loop this one`}
                    className={`btn btn-sm btn-link`}
                    onClick={() =>
                        audioControl.set(timestampStart, timestampEnd)
                    }
                >
                    <i className="fa-solid fa-repeat"></i>
                </button>
                {btnPlayShow && (
                    <button
                        title={`Play from here`}
                        className={`btn btn-sm btn-link`}
                        onClick={() => audioControl.set(timestampStart, null)}
                    >
                        <i className="fa-solid fa-play"></i>
                    </button>
                )}
                {btnPauseShow && (
                    <button
                        title={`Pause`}
                        className={`btn btn-sm btn-link`}
                        onClick={() => audioControl.pause()}
                    >
                        <i className="fa-solid fa-pause"></i>
                    </button>
                )}
                <button
                    title={`Stop highlight and auto-scroll`}
                    className={`btn btn-sm btn-link ${
                        highlighter ? 'text-primary' : 'text-secondary'
                    }`}
                    onClick={() => {
                        const rs = !highlighter
                        handleHighlighter(rs)
                    }}
                >
                    <i className="fa-solid fa-highlighter"></i>
                </button>
            </div>
        )
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
                const hadTranslation =
                    translationCode &&
                    translation &&
                    translation[translationCode]
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
                                {hadTranslation && (
                                    <small>
                                        {translation[translationCode]}
                                    </small>
                                )}
                            </StyledParagraphTranslation>
                            <StyledScriptTag
                                className={`script`}
                                dangerouslySetInnerHTML={{
                                    __html: scriptContent
                                }}
                            ></StyledScriptTag>
                            {doButtonGroup(line, idx)}
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
