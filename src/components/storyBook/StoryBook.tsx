import React, { SyntheticEvent, useEffect, useState } from 'react'
import {
    Caption,
    CaptionLine,
    CaptionTimestamp,
    TypeAudioTimeFormat
} from '../../interfaces/Caption'
import { StyledParagraph, StyledParagraphLine } from '../styled/StyledParagraph'
import WordsData from '../../utils/words'
import styled from 'styled-components'

interface Props {
    audioSourceUrl: string
    handleAudio: any
    storyName: string
    captions: {
        map(element: (caption: Caption, idx: string) => JSX.Element): any
    }
    children: React.ReactElement | undefined
    translationCode?: any
}

const timeLoopDefault = {
    start: null,
    end: null
}

const StoryBook: React.FC<Props> = (props) => {
    const { children } = props
    const { audioSourceUrl, handleAudio } = props
    const { storyName, captions, translationCode } = props
    const [highlighter, setHighlighter] = useState<boolean>(true)
    const [audio, setAudio] = useState<HTMLAudioElement>()
    const [currentTime, setCurrentTime] = useState(0)
    const [timeLoop, setTimeLoop] = useState<CaptionTimestamp>(timeLoopDefault)
    const [currentLineId, setCurrentLineId] = useState<string | null>(null)
    const audioLoadedData = (event: SyntheticEvent) => {
        handleAudio(event.target as HTMLAudioElement)
        setAudio(event.target as HTMLAudioElement)
    }
    const audioControl = {
        set: async (start: TypeAudioTimeFormat, end: TypeAudioTimeFormat) => {
            setTimeLoop({
                start: start,
                end: end
            })
            await audioControl.play(start)
        },
        play: async (start: TypeAudioTimeFormat) => {
            if (!audio) return
            if (start !== null) audio.currentTime = start
            await audio.play()
        },
        pause: () => {
            if (!audio) return
            audio.pause()
        }
    }
    const handleTimeUpdate = () => {
        const doLooping = () => {
            if (!audio) return
            if (!timeLoop) return
            if (timeLoop.start && timeLoop.start >= audio.currentTime) {
                audio.currentTime = timeLoop.start || 0
            } else if (timeLoop.end && timeLoop.end <= audio.currentTime) {
                audio.currentTime = timeLoop.start || 0
            }
        }
        const doHighlightAndScroll = () => {
            if (!audio) return
            if (!document) return
            const storyContent = document.querySelector('.storyContent')
            if (!storyContent) return
            const paragraphs = storyContent.querySelectorAll('.storyParagraph')
            if (!paragraphs) return
            setCurrentLineId(null)
            paragraphs.forEach((el) => {
                if (!(el instanceof HTMLElement)) return
                const targeted =
                    audio.currentTime >= Number(el?.dataset.start) &&
                    audio.currentTime < Number(el?.dataset.end)
                el.dataset.highlight =
                    highlighter && targeted ? 'true' : 'false'
                if (targeted) {
                    setCurrentLineId(el.id)
                    if (highlighter) {
                        el.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        })
                    }
                }
            })
        }
        if (audio) setCurrentTime(audio.currentTime)
        doLooping()
        doHighlightAndScroll()
    }
    const parserParagraph = (data: [CaptionLine], parentId: string) => {
        return data.map((line, idx) => {
            const eleId = `${parentId}l${idx}`
            const standalone = line.standalone
            const timestampStart = line.start
            const timestampEnd = line.end
            const translation = line.translation
            let scriptContent = line.content
            WordsData.forEach((word, idx) => {
                let actualWord = ''
                const keyword = word.word
                const targetWordIndex = scriptContent
                    .toLowerCase()
                    .search(keyword.toLowerCase())
                if (targetWordIndex >= 0) {
                    actualWord = scriptContent.substring(
                        targetWordIndex,
                        targetWordIndex + keyword.length
                    )
                    const newWord = `<span class="translationTag" data-word-idx="${idx}">${actualWord}</span>`
                    scriptContent = scriptContent.replace(actualWord, newWord)
                }
            })
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
                        <div className={`text-muted`}>
                            {translationCode &&
                                translation &&
                                translation[translationCode] && (
                                    <small>
                                        {translation[translationCode]}
                                    </small>
                                )}
                            {!translation && <small>...</small>}
                        </div>
                        <StyledScriptTag
                            className={`script`}
                            dangerouslySetInnerHTML={{ __html: scriptContent }}
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
                            {(eleId !== currentLineId || audio?.paused) && (
                                <button
                                    title={`Play from here`}
                                    className={`btn btn-sm btn-link`}
                                    onClick={() =>
                                        audioControl.set(timestampStart, null)
                                    }
                                >
                                    <i className="fa-solid fa-play"></i>
                                </button>
                            )}
                            {eleId === currentLineId && !audio?.paused && (
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
                                onClick={() => setHighlighter(!highlighter)}
                            >
                                <i className="fa-solid fa-highlighter"></i>
                            </button>
                        </div>
                    </div>
                </StyledParagraphLine>
            )
        })
    }
    useEffect(() => {
        const storyContent = document.querySelector('.storyContent')
        if (!storyContent) return
        const translationTooltip = storyContent.querySelector(
            '.translationTooltip'
        )
        if (!translationTooltip) return
        const translationTags = storyContent.querySelectorAll('.translationTag')
        const handlerClick = (el: any) => {
            if (!(translationTooltip instanceof HTMLElement)) return
            const offsetTop = storyContent.getBoundingClientRect().top
            const offsetLeft = storyContent.getBoundingClientRect().left
            const elementWidth = el.target.getBoundingClientRect().width
            const elementHeight = el.target.getBoundingClientRect().height
            const wordIdx = el.target.dataset.wordIdx
            const translation = WordsData[wordIdx].translation[translationCode]

            // Reset
            translationTooltip.classList.remove('show')
            translationTooltip.innerHTML = ``
            translationTooltip.style.left = `0px`
            translationTooltip.style.top = `0px`

            // Setup
            translationTooltip.innerHTML = translation.join('')
            translationTooltip.classList.add('show')
            translationTooltip.style.left = `${
                el.target.getBoundingClientRect().x -
                offsetLeft -
                translationTooltip.offsetWidth / 2 +
                elementWidth / 2
            }px`
            translationTooltip.style.top = `${
                4 +
                el.target.getBoundingClientRect().y -
                offsetTop -
                translationTooltip.offsetHeight -
                elementHeight / 2
            }px`
        }
        const handlerHideShow = (el: any) => {
            el.target.classList.remove('show')
        }
        const handleResize = () => {
            translationTooltip.classList.remove('show')
        }

        translationTooltip.addEventListener('click', handlerHideShow)
        translationTags.forEach((tag) => {
            tag.addEventListener('click', handlerClick)
        })
        window.addEventListener('resize', handleResize)
        return () => {
            translationTooltip.removeEventListener('click', handlerHideShow)
            translationTags.forEach((tag) => {
                tag.removeEventListener('click', handlerClick)
            })
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <div>
                <audio
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedData={audioLoadedData}
                >
                    <source src={audioSourceUrl} type={`audio/mp3`} />
                    Your browser does not support the audio element.
                </audio>
                <p>Current: {currentTime}</p>
                <p>
                    Loop: {timeLoop.start} / {timeLoop.end}
                </p>
            </div>
            <StyledStoryContent className={`storyContent`}>
                <StyledTranslationTooltip
                    className={`translationTooltip`}
                ></StyledTranslationTooltip>
                {captions.map((caption: Caption, idx: string) => {
                    const eleId = `p${idx}`
                    return (
                        <React.Fragment key={idx}>
                            {caption.type === 'paragraph' && (
                                <StyledParagraph id={eleId}>
                                    {parserParagraph(caption.data, eleId)}
                                </StyledParagraph>
                            )}
                        </React.Fragment>
                    )
                })}
            </StyledStoryContent>
            {children}
        </main>
    )
}

export default StoryBook

const StyledTranslationTooltip = styled.div`
    background: #ffeb3b;
    border-radius: 0.4rem;
    box-shadow: 0 0 1rem rgb(0 0 0 / 0.8%);
    display: none;
    font-size: 0.8rem;
    padding: 8px;

    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    user-select: none;

    ul,
    ol {
        margin: 0;
        padding-left: 1rem;
    }

    &.show {
        display: block;
    }

    &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 0;
        border: 0.5em solid transparent;
        border-top-color: #ffeb3b;
        border-bottom: 0;
        margin-left: -0.5em;
        margin-bottom: -0.5em;
    }
`

const StyledScriptTag = styled.div`
    > .translationTag {
        cursor: pointer;
        text-decoration: underline;
        position: relative;
    }
`

const StyledStoryContent = styled.div`
    position: relative;
`
