import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Caption, CaptionTimestamp } from '../../interfaces/Caption'
import StoryBookParagraph from './StoryBookParagraph'
import { DOMTranslationTag } from '../../utils/DOM'
import { useStory } from '../../context/StoryContext'
import TranslationTooltip from '../tools/tooltips/TranslationTooltip'
import TranslationBottomUp from '../tools/bottomUp/TranslationBottomUp'

interface Props {
    audioSourceUrl: string
    handleAudio: any
    storyName: string
    captions: {
        map(element: (caption: Caption, idx: string) => JSX.Element): any
    }
    locale: string
    children: React.ReactElement | undefined
}

const StoryBook: React.FC<Props> = (props) => {
    // Declare
    const { storyName, captions, children, locale } = props
    const { audioSourceUrl, handleAudio } = props
    const audioRef = useRef<HTMLAudioElement>(
        typeof window !== 'undefined' ? new Audio(audioSourceUrl) : null
    )
    const audio = audioRef.current
    const { story, storyDispatch } = useStory()
    // Functions
    const handleAudioOnTimeUpdate = () => {
        const doLooping = () => {
            const tl = story.timeLoop
            if (!audio || !tl) return
            if (tl.start && tl.start >= audio.currentTime) {
                audio.currentTime = tl.start || 0
            } else if (tl.end && tl.end <= audio.currentTime) {
                audio.currentTime = tl.start || 0
            }
        }
        const doHighlightAndScroll = () => {
            if (!audio) return
            const paragraphs = document.querySelectorAll(
                '.storyContent .storyParagraph'
            )
            const translationTooltip = document.querySelector(
                '.storyContent .translationTooltip'
            )
            if (!paragraphs || !translationTooltip) return
            const implement = (el: HTMLElement) => {
                const ct = audio.currentTime
                const ds = el?.dataset
                const isShown = translationTooltip.classList.contains('show')
                const targeted = ct >= Number(ds.start) && ct < Number(ds.end)
                const autoScroll = story.highlighter && !isShown
                ds.highlight = story.highlighter && targeted ? 'true' : 'false'
                if (!targeted) return
                storyDispatch({
                    type: 'currentParagraphId',
                    payload: el.id
                })
                if (!autoScroll) return
                el.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                })
            }
            storyDispatch({
                type: 'currentParagraphId',
                payload: ''
            })
            paragraphs.forEach((el) => {
                implement(el as HTMLElement)
            })
        }
        doLooping()
        doHighlightAndScroll()
    }
    // Context Control
    const handleAudioPause = (data: boolean) => {
        storyDispatch({
            type: 'audioPause',
            payload: data
        })
    }
    const handleAudioTimeLoop = (data: CaptionTimestamp) => {
        storyDispatch({
            type: 'audioTimeLoop',
            payload: data
        })
    }
    const handleHighlighter = (data: boolean) => {
        storyDispatch({
            type: 'highlighter',
            payload: data
        })
    }
    // Life Cycle
    const effects = {
        audioInitial: () => {
            if (!audio) return
            audio.addEventListener('timeupdate', handleAudioOnTimeUpdate)
            audio.load()
            handleAudio(audio)
            return () => {
                audio.removeEventListener('timeupdate', handleAudioOnTimeUpdate)
            }
        },
        audioEventListenerRefresh: () => {
            if (!audio) return
            audio.addEventListener('timeupdate', handleAudioOnTimeUpdate)
            return () => {
                audio.removeEventListener('timeupdate', handleAudioOnTimeUpdate)
            }
        }
    }
    useEffect(effects.audioInitial, [])
    useEffect(effects.audioEventListenerRefresh, [
        story.highlighter,
        story.timeLoop
    ])
    useEffect(() => {
        const handleClick = (el: Event) => {
            const target = el.target as HTMLElement
            const wordId = target.dataset.wordIdx
            storyDispatch({
                type: 'translation',
                payload: {
                    ...story.translation,
                    wordId: wordId || '',
                    tooltip: {
                        display: true
                    }
                }
            })
        }
        DOMTranslationTag.unset(handleClick) // TODO: No DOM
        DOMTranslationTag.setup(handleClick) // TODO: No DOM
        return () => DOMTranslationTag.unset(handleClick) // TODO: No DOM
    }, [])
    // Output
    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <StyledStoryContent className={`storyContent`}>
                <TranslationTooltip locale={locale}></TranslationTooltip>
                {captions.map((caption: Caption, idx: string) => (
                    <React.Fragment key={idx}>
                        {caption.type === 'paragraph' && (
                            <StoryBookParagraph
                                id={`p${idx}`}
                                data={caption.data}
                                currentScriptId={story.currentParagraphId}
                                locale={locale}
                                audio={audio}
                                handleAudioTimeLoop={handleAudioTimeLoop}
                                pause={story.pause}
                                handleAudioPause={handleAudioPause}
                                highlighter={story.highlighter}
                                handleHighlighter={handleHighlighter}
                            ></StoryBookParagraph>
                        )}
                    </React.Fragment>
                ))}
                <TranslationBottomUp locale={locale}></TranslationBottomUp>
            </StyledStoryContent>
            {children}
        </main>
    )
}

export default StoryBook

const StyledStoryContent = styled.div`
    position: relative;
`
