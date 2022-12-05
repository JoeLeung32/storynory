import React, { SyntheticEvent } from 'react'
import styled from 'styled-components'
import {
    StyledParagraphLine,
    StyledParagraphTranslation
} from '../styled/StyledParagraph'
import { CaptionLine, TypeAudioTimeFormat } from '../../interfaces/Caption'
import { MdxWordsNodes } from '../../interfaces/Mdx'
import { useWordData } from '../../context/WordData'
import { useStory } from '../../context/StoryContext'

interface Props {
    id: string
    locale?: string
    audio?: HTMLAudioElement | null
    data: [CaptionLine]
}

const StoryBookParagraph: React.FC<Props> = (props) => {
    const { story, storyDispatch } = useStory()
    const { data, id: parentId, locale } = props
    const { audio } = props
    const wordsMdx = useWordData.all()
    const charsRegExp = new RegExp(/[ ,.;:~\-=#_"'“‘()\[\]{}?!/\\]/)
    const audioControl = {
        highlight: () => {
            storyDispatch({
                type: 'highlighter',
                payload: !story.highlighter
            })
        },
        set: async (start: TypeAudioTimeFormat, end: TypeAudioTimeFormat) => {
            storyDispatch({
                type: 'audioTimeLoop',
                payload: {
                    start: start,
                    end: end
                }
            })
            if (!audio) return
            audio.currentTime = start || 0
            await audio.play()
            storyDispatch({
                type: 'audioPause',
                payload: false
            })
        },
        pause: () => {
            if (!audio) return
            audio?.pause()
            storyDispatch({
                type: 'audioPause',
                payload: true
            })
        }
    }
    const TranslationTag = (parentIdx: string, line: CaptionLine) => {
        let scriptContent = line.content
        if (!wordsMdx) return scriptContent

        const matchedCase: string[] = []
        const matchedPair: { [x: string]: number } = {}
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
                matchedCase.push(actualWord)
                matchedPair[actualWord] = idx
            }
        })
        if (!matchedCase || !matchedCase.length) return scriptContent

        return scriptContent
            .split(new RegExp(matchedCase.join('|')))
            .map((string, index) => {
                const targetedWord = matchedCase[index]
                if (!targetedWord)
                    return <React.Fragment key={index}>{string}</React.Fragment>
                const handleClick = (event: SyntheticEvent) => {
                    const target = event.target as HTMLElement
                    storyDispatch({
                        type: 'translationBottomUp',
                        payload: {
                            ...story.translationBottomUp,
                            wordId: target.dataset.wordIdx,
                            display: true
                        }
                    })
                }
                return (
                    <React.Fragment key={index}>
                        {string}
                        <span
                            className={`translationTag`}
                            data-word-idx={matchedPair[targetedWord]}
                            onClick={handleClick}
                        >
                            {targetedWord}
                        </span>
                        &nbsp;
                        <i className="text-danger fa-solid fa-language"></i>
                    </React.Fragment>
                )
            })
    }
    const ButtonGroup = (line: CaptionLine, idx: number) => {
        const eleId = `${parentId}l${idx}`
        const timestampStart = line.start
        const timestampEnd = line.end
        const btnPlayShow =
            eleId !== story.currentParagraphId || story.audioPause
        const btnPauseShow =
            eleId === story.currentParagraphId && !story.audioPause
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
                        story.highlighter ? 'text-primary' : 'text-secondary'
                    }`}
                    onClick={() => audioControl.highlight()}
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
                const hadTranslation =
                    locale && translation && translation[locale]
                return (
                    <StyledParagraphLine
                        key={idx}
                        standalone={standalone}
                        id={eleId}
                        data-start={timestampStart}
                        data-end={timestampEnd}
                        data-highlight={
                            story.currentParagraphId === eleId &&
                            story.highlighter
                        }
                    >
                        <div className={`p-2 px-3`}>
                            <StyledParagraphTranslation>
                                {hadTranslation && (
                                    <small>{translation[locale]}</small>
                                )}
                            </StyledParagraphTranslation>
                            <StyledScriptTag>
                                {TranslationTag(eleId, line)}
                            </StyledScriptTag>
                            {ButtonGroup(line, idx)}
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
