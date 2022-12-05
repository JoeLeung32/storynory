import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Caption } from '../../interfaces/Caption'
import StoryBookParagraph from './StoryBookParagraph'
import { DOMTranslationTag } from '../../utils/DOM'
import { useStory } from '../../context/StoryContext'
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
            const tl = story.audioTimeLoop
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
            if (!paragraphs) return
            const implement = (ele: HTMLElement) => {
                const ct = audio.currentTime
                const ds = ele?.dataset
                const targeted = ct >= Number(ds.start) && ct < Number(ds.end)
                const autoScroll = story.highlighter
                ds.highlight = story.highlighter && targeted ? 'true' : 'false'
                if (!targeted) return
                storyDispatch({
                    type: 'currentParagraphId',
                    payload: ele.id
                })
                if (!autoScroll) return
                ele.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                })
            }
            paragraphs.forEach((el) => {
                implement(el as HTMLElement)
            })
        }
        doLooping()
        doHighlightAndScroll()
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
        story.audioTimeLoop
    ])
    useEffect(() => {
        const handleClick = (event: Event) => {
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
        DOMTranslationTag.unset(handleClick) // TODO: No DOM
        DOMTranslationTag.setup(handleClick) // TODO: No DOM
        return () => DOMTranslationTag.unset(handleClick) // TODO: No DOM
    }, [])
    // Output
    return (
        <main className={`container-fluid`}>
            <h1>{storyName}</h1>
            <StyledStoryContent className={`storyContent`}>
                {captions.map((caption: Caption, idx: string) => (
                    <React.Fragment key={idx}>
                        {caption.type === 'paragraph' && (
                            <StoryBookParagraph
                                id={`p${idx}`}
                                locale={locale}
                                audio={audio}
                                data={caption.data}
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
