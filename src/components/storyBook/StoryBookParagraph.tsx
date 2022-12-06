import React from 'react'
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
                type: 'audioRepeat',
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
            const wordSearch = (word: string, content: string) => {
                const targetWordIndex = content
                    .toLowerCase()
                    .search(word.toLowerCase())
                const twiPrevString = content.substring(
                    targetWordIndex - 1,
                    targetWordIndex
                )
                const twiNextString = content.substring(
                    targetWordIndex + word.length,
                    targetWordIndex + word.length + 1
                )
                const isMatchedCharsRexExp =
                    twiPrevString.search(charsRegExp) === 0 &&
                    twiNextString.search(charsRegExp) === 0
                return isMatchedCharsRexExp
                    ? { word, index: targetWordIndex }
                    : null
            }
            const slug = node.frontmatter.slug.toString()
            const variation = node.frontmatter?.variation || []
            const keyword = [slug, ...variation]
                .map((str) => wordSearch(str, scriptContent))
                .filter((k) => k)
                .pop() as { word: string; index: number } | null
            if (!keyword || !keyword.word || keyword.index < 0) return
            const actualWord = scriptContent.substring(
                keyword.index,
                keyword.index + keyword.word.length
            )
            matchedCase.push(actualWord)
            matchedPair[actualWord] = idx
        })
        if (!matchedCase || !matchedCase.length) return scriptContent

        return scriptContent
            .split(new RegExp(matchedCase.join('|')))
            .map((string, index) => {
                const tagIdx = `${parentIdx}t${index}`
                const tagWord = matchedCase[index]
                if (!tagWord)
                    return <React.Fragment key={index}>{string}</React.Fragment>
                const handleClick = () => {
                    storyDispatch({
                        type: 'translationBottomUp',
                        payload: {
                            ...story.translationBottomUp,
                            tagIdx: tagIdx,
                            wordId: matchedPair[tagWord].toString(),
                            display: true
                        }
                    })
                }
                return (
                    <React.Fragment key={index}>
                        {string}
                        <span
                            className={`translationTag ${
                                story.translationBottomUp.tagIdx === tagIdx
                                    ? 'bg-warning'
                                    : null
                            }`}
                            data-tag-idx={tagIdx}
                            data-word-idx={matchedPair[tagWord]}
                            onClick={handleClick}
                        >
                            <span>{tagWord}</span>
                            &nbsp;
                            <i className="text-danger fa-solid fa-language"></i>
                        </span>
                    </React.Fragment>
                )
            })
    }
    const doButtonGroup = (line: CaptionLine, idx: number) => {
        const eleId = `${parentId}l${idx}`
        const timestampStart = line.start
        const timestampEnd = line.end
        const btnPlayShow =
            eleId !== story.currentParagraphId || story.audioPause
        const btnPauseShow =
            eleId === story.currentParagraphId && !story.audioPause
        const BtnRepeat = () => (
            <button
                title={`Repeat this one`}
                className={`btn btn-sm btn-link`}
                onClick={() => audioControl.set(timestampStart, timestampEnd)}
            >
                <i className="fa-solid fa-repeat"></i>
            </button>
        )
        const BtnPlay = () => (
            <button
                title={`Play from here`}
                className={`btn btn-sm btn-link`}
                onClick={() => audioControl.set(timestampStart, null)}
            >
                <i className="fa-solid fa-play"></i>
            </button>
        )
        const BtnPause = () => (
            <button
                title={`Pause`}
                className={`btn btn-sm btn-link`}
                onClick={() => audioControl.pause()}
            >
                <i className="fa-solid fa-pause"></i>
            </button>
        )
        const BtnHighlight = () => (
            <button
                title={`Stop highlight and auto-scroll`}
                className={`btn btn-sm btn-link ${
                    story.highlighter ? 'text-primary' : 'text-secondary'
                }`}
                onClick={() => audioControl.highlight()}
            >
                <i className="fa-solid fa-highlighter"></i>
            </button>
        )
        return (
            <div>
                <BtnRepeat />
                {btnPlayShow && <BtnPlay />}
                {btnPauseShow && <BtnPause />}
                <BtnHighlight />
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
                        <div
                            className={`p-2 px-3 ${
                                story.currentParagraphId === eleId &&
                                story.highlighter
                                    ? 'alert alert-warning'
                                    : ''
                            }`}
                        >
                            <StyledParagraphTranslation>
                                {hadTranslation && (
                                    <small>{translation[locale]}</small>
                                )}
                            </StyledParagraphTranslation>
                            <StyledScriptTag>
                                {TranslationTag(eleId, line)}
                            </StyledScriptTag>
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
        span {
            font-weight: bold;
            text-decoration: underline;
            position: relative;
        }
    }
`
